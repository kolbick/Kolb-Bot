import KolbBotKit
import Network
import Testing
@testable import KolbBot

@Suite struct GatewayEndpointIDTests {
    @Test func stableIDForServiceDecodesAndNormalizesName() {
        let endpoint = NWEndpoint.service(
            name: "KolbBot\\032Gateway   \\032  Node\n",
            type: "_kolb-bot-gw._tcp",
            domain: "local.",
            interface: nil)

        #expect(GatewayEndpointID.stableID(endpoint) == "_kolb-bot-gw._tcp|local.|KolbBot Gateway Node")
    }

    @Test func stableIDForNonServiceUsesEndpointDescription() {
        let endpoint = NWEndpoint.hostPort(host: NWEndpoint.Host("127.0.0.1"), port: 4242)
        #expect(GatewayEndpointID.stableID(endpoint) == String(describing: endpoint))
    }

    @Test func prettyDescriptionDecodesBonjourEscapes() {
        let endpoint = NWEndpoint.service(
            name: "KolbBot\\032Gateway",
            type: "_kolb-bot-gw._tcp",
            domain: "local.",
            interface: nil)

        let pretty = GatewayEndpointID.prettyDescription(endpoint)
        #expect(pretty == BonjourEscapes.decode(String(describing: endpoint)))
        #expect(!pretty.localizedCaseInsensitiveContains("\\032"))
    }
}
