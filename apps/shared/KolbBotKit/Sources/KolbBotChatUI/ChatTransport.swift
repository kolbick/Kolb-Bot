import Foundation

public enum KolbBotChatTransportEvent: Sendable {
    case health(ok: Bool)
    case tick
    case chat(KolbBotChatEventPayload)
    case agent(KolbBotAgentEventPayload)
    case seqGap
}

public protocol KolbBotChatTransport: Sendable {
    func requestHistory(sessionKey: String) async throws -> KolbBotChatHistoryPayload
    func sendMessage(
        sessionKey: String,
        message: String,
        thinking: String,
        idempotencyKey: String,
        attachments: [KolbBotChatAttachmentPayload]) async throws -> KolbBotChatSendResponse

    func abortRun(sessionKey: String, runId: String) async throws
    func listSessions(limit: Int?) async throws -> KolbBotChatSessionsListResponse

    func requestHealth(timeoutMs: Int) async throws -> Bool
    func events() -> AsyncStream<KolbBotChatTransportEvent>

    func setActiveSessionKey(_ sessionKey: String) async throws
}

extension KolbBotChatTransport {
    public func setActiveSessionKey(_: String) async throws {}

    public func abortRun(sessionKey _: String, runId _: String) async throws {
        throw NSError(
            domain: "KolbBotChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "chat.abort not supported by this transport"])
    }

    public func listSessions(limit _: Int?) async throws -> KolbBotChatSessionsListResponse {
        throw NSError(
            domain: "KolbBotChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "sessions.list not supported by this transport"])
    }
}
