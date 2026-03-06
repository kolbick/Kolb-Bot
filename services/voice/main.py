"""
Kolb-Bot Voice Service: streaming STT + TTS with barge-in support.

Endpoints:
  POST /v1/audio/transcriptions — Whisper-compatible STT
  POST /v1/audio/speech         — OpenAI-compatible TTS (via edge-tts)
  WS   /v1/voice/stream         — Full-duplex voice: mic→STT→LLM→TTS→speaker
                                   with barge-in (client sends audio while
                                   assistant is speaking; assistant stops)
"""

from __future__ import annotations

import asyncio
import io
import json
import os
import tempfile
import time
import uuid
from contextlib import asynccontextmanager

import edge_tts
import httpx
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

VOICE_PORT = int(os.environ.get("VOICE_PORT", "8100"))
BRIDGE_URL = os.environ.get("BRIDGE_URL", "http://kolbbot-bridge:8000")
GATEWAY_TOKEN = os.environ.get("KOLB_BOT_GATEWAY_TOKEN", "")
STT_ENGINE = os.environ.get("STT_ENGINE", "whisper")
TTS_ENGINE = os.environ.get("TTS_ENGINE", "edge-tts")
WHISPER_MODEL_NAME = os.environ.get("WHISPER_MODEL", "base")
DEFAULT_TTS_VOICE = os.environ.get("TTS_VOICE", "en-US-AriaNeural")

whisper_model = None


def load_whisper():
    global whisper_model
    if whisper_model is None:
        import whisper
        whisper_model = whisper.load_model(WHISPER_MODEL_NAME)
    return whisper_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    if STT_ENGINE == "whisper":
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, load_whisper)
    yield


app = FastAPI(title="Kolb-Bot Voice", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "kolbbot-voice", "stt": STT_ENGINE, "tts": TTS_ENGINE}


# ---------------------------------------------------------------------------
# STT: Whisper-compatible transcription endpoint
# ---------------------------------------------------------------------------

@app.post("/v1/audio/transcriptions")
async def transcribe(
    file: UploadFile = File(...),
    model: str = Form("whisper-1"),
    language: str = Form("en"),
):
    audio_bytes = await file.read()

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tmp:
        tmp.write(audio_bytes)
        tmp.flush()

        loop = asyncio.get_event_loop()
        model_instance = load_whisper()
        result = await loop.run_in_executor(
            None,
            lambda: model_instance.transcribe(tmp.name, language=language),
        )

    return {"text": result.get("text", "").strip()}


# ---------------------------------------------------------------------------
# TTS: OpenAI-compatible speech endpoint (backed by edge-tts)
# ---------------------------------------------------------------------------

@app.post("/v1/audio/speech")
async def text_to_speech(request: dict):
    text = request.get("input", "")
    voice = request.get("voice", DEFAULT_TTS_VOICE)
    response_format = request.get("response_format", "mp3")

    voice_map = {
        "alloy": "en-US-AriaNeural",
        "echo": "en-US-GuyNeural",
        "fable": "en-GB-SoniaNeural",
        "onyx": "en-US-ChristopherNeural",
        "nova": "en-US-JennyNeural",
        "shimmer": "en-US-AmberNeural",
    }
    edge_voice = voice_map.get(voice, voice)

    audio_chunks = []
    communicate = edge_tts.Communicate(text, edge_voice)
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])

    if not audio_chunks:
        raise HTTPException(500, "TTS produced no audio")

    audio_data = b"".join(audio_chunks)
    media_type = "audio/mpeg" if response_format == "mp3" else f"audio/{response_format}"
    return StreamingResponse(io.BytesIO(audio_data), media_type=media_type)


# ---------------------------------------------------------------------------
# Full-duplex voice WebSocket with barge-in
# ---------------------------------------------------------------------------

class VoiceSession:
    def __init__(self, ws: WebSocket):
        self.ws = ws
        self.session_id = str(uuid.uuid4())
        self.is_speaking = False
        self.barge_in_event = asyncio.Event()
        self.conversation: list[dict] = []
        self.cancelled = False

    async def handle_barge_in(self):
        self.is_speaking = False
        self.barge_in_event.set()
        await self.ws.send_json({
            "type": "barge_in",
            "message": "Assistant interrupted",
        })

    async def transcribe_audio(self, audio_data: bytes) -> str:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tmp:
            tmp.write(audio_data)
            tmp.flush()
            loop = asyncio.get_event_loop()
            model_instance = load_whisper()
            result = await loop.run_in_executor(
                None,
                lambda: model_instance.transcribe(tmp.name, language="en"),
            )
        return result.get("text", "").strip()

    async def get_llm_response(self, text: str) -> str:
        self.conversation.append({"role": "user", "content": text})

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{BRIDGE_URL}/v1/chat/completions",
                json={
                    "model": "kolb-bot",
                    "messages": self.conversation,
                    "stream": False,
                },
                headers={"Authorization": f"Bearer {GATEWAY_TOKEN}"},
            )
            data = resp.json()

        content = data["choices"][0]["message"]["content"]
        self.conversation.append({"role": "assistant", "content": content})
        return content

    async def speak(self, text: str):
        self.is_speaking = True
        self.barge_in_event.clear()

        communicate = edge_tts.Communicate(text, DEFAULT_TTS_VOICE)
        async for chunk in communicate.stream():
            if self.barge_in_event.is_set():
                return
            if chunk["type"] == "audio":
                await self.ws.send_bytes(chunk["data"])

        self.is_speaking = False
        await self.ws.send_json({"type": "speech_done"})


@app.websocket("/v1/voice/stream")
async def voice_stream(ws: WebSocket):
    await ws.accept()
    session = VoiceSession(ws)
    await ws.send_json({
        "type": "session_start",
        "session_id": session.session_id,
    })

    try:
        while True:
            msg = await ws.receive()

            if msg.get("type") == "websocket.disconnect":
                break

            if "bytes" in msg and msg["bytes"]:
                audio_data = msg["bytes"]

                if session.is_speaking:
                    await session.handle_barge_in()

                await ws.send_json({"type": "transcribing"})
                text = await session.transcribe_audio(audio_data)

                if not text:
                    await ws.send_json({"type": "no_speech"})
                    continue

                await ws.send_json({"type": "transcript", "text": text})

                await ws.send_json({"type": "thinking"})
                response = await session.get_llm_response(text)
                await ws.send_json({"type": "response_text", "text": response})

                await session.speak(response)

            elif "text" in msg and msg["text"]:
                data = json.loads(msg["text"])
                if data.get("type") == "barge_in":
                    await session.handle_barge_in()
                elif data.get("type") == "end_session":
                    break

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await ws.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
