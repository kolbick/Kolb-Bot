FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /data

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN ln -sf /opt/claude/versions/2.1.63 /usr/local/bin/claude \
    && ln -sf /usr/lib/node_modules/@openai/codex/bin/codex.js /usr/local/bin/codex \
    && ln -sf /usr/lib/node_modules/@google/gemini-cli/dist/index.js /usr/local/bin/gemini

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
