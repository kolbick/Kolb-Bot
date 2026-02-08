import Foundation
import Testing
@testable import KolbBot

@Suite(.serialized)
struct KolbBotConfigFileTests {
    @Test
    func configPathRespectsEnvOverride() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("kolb-bot-config-\(UUID().uuidString)")
            .appendingPathComponent("kolb-bot.json")
            .path

        await TestIsolation.withEnvValues(["KOLB_BOT_CONFIG_PATH": override]) {
            #expect(KolbBotConfigFile.url().path == override)
        }
    }

    @MainActor
    @Test
    func remoteGatewayPortParsesAndMatchesHost() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("kolb-bot-config-\(UUID().uuidString)")
            .appendingPathComponent("kolb-bot.json")
            .path

        await TestIsolation.withEnvValues(["KOLB_BOT_CONFIG_PATH": override]) {
            KolbBotConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "ws://gateway.ts.net:19999",
                    ],
                ],
            ])
            #expect(KolbBotConfigFile.remoteGatewayPort() == 19999)
            #expect(KolbBotConfigFile.remoteGatewayPort(matchingHost: "gateway.ts.net") == 19999)
            #expect(KolbBotConfigFile.remoteGatewayPort(matchingHost: "gateway") == 19999)
            #expect(KolbBotConfigFile.remoteGatewayPort(matchingHost: "other.ts.net") == nil)
        }
    }

    @MainActor
    @Test
    func setRemoteGatewayUrlPreservesScheme() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("kolb-bot-config-\(UUID().uuidString)")
            .appendingPathComponent("kolb-bot.json")
            .path

        await TestIsolation.withEnvValues(["KOLB_BOT_CONFIG_PATH": override]) {
            KolbBotConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "wss://old-host:111",
                    ],
                ],
            ])
            KolbBotConfigFile.setRemoteGatewayUrl(host: "new-host", port: 2222)
            let root = KolbBotConfigFile.loadDict()
            let url = ((root["gateway"] as? [String: Any])?["remote"] as? [String: Any])?["url"] as? String
            #expect(url == "wss://new-host:2222")
        }
    }

    @Test
    func stateDirOverrideSetsConfigPath() async {
        let dir = FileManager().temporaryDirectory
            .appendingPathComponent("kolb-bot-state-\(UUID().uuidString)", isDirectory: true)
            .path

        await TestIsolation.withEnvValues([
            "KOLB_BOT_CONFIG_PATH": nil,
            "KOLB_BOT_STATE_DIR": dir,
        ]) {
            #expect(KolbBotConfigFile.stateDirURL().path == dir)
            #expect(KolbBotConfigFile.url().path == "\(dir)/kolb-bot.json")
        }
    }
}
