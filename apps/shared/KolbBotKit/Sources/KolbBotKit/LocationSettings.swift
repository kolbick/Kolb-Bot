import Foundation

public enum KolbBotLocationMode: String, Codable, Sendable, CaseIterable {
    case off
    case whileUsing
    case always
}
