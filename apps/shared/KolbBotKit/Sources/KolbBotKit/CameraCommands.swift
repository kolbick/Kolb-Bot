import Foundation

public enum KolbBotCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum KolbBotCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum KolbBotCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum KolbBotCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct KolbBotCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: KolbBotCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: KolbBotCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: KolbBotCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: KolbBotCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct KolbBotCameraClipParams: Codable, Sendable, Equatable {
    public var facing: KolbBotCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: KolbBotCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: KolbBotCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: KolbBotCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
