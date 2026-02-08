package ai.kolb-bot.android.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class KolbBotProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", KolbBotCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", KolbBotCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", KolbBotCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", KolbBotCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", KolbBotCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", KolbBotCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", KolbBotCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", KolbBotCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", KolbBotCapability.Canvas.rawValue)
    assertEquals("camera", KolbBotCapability.Camera.rawValue)
    assertEquals("screen", KolbBotCapability.Screen.rawValue)
    assertEquals("voiceWake", KolbBotCapability.VoiceWake.rawValue)
  }

  @Test
  fun screenCommandsUseStableStrings() {
    assertEquals("screen.record", KolbBotScreenCommand.Record.rawValue)
  }
}
