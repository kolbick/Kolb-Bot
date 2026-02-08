// swift-tools-version: 6.2
// Package manifest for the KolbBot macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "KolbBot",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "KolbBotIPC", targets: ["KolbBotIPC"]),
        .library(name: "KolbBotDiscovery", targets: ["KolbBotDiscovery"]),
        .executable(name: "KolbBot", targets: ["KolbBot"]),
        .executable(name: "kolb-bot-mac", targets: ["KolbBotMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.1.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.8.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.8.1"),
        .package(url: "https://github.com/steipete/Peekaboo.git", branch: "main"),
        .package(path: "../shared/KolbBotKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "KolbBotIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "KolbBotDiscovery",
            dependencies: [
                .product(name: "KolbBotKit", package: "KolbBotKit"),
            ],
            path: "Sources/KolbBotDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "KolbBot",
            dependencies: [
                "KolbBotIPC",
                "KolbBotDiscovery",
                .product(name: "KolbBotKit", package: "KolbBotKit"),
                .product(name: "KolbBotChatUI", package: "KolbBotKit"),
                .product(name: "KolbBotProtocol", package: "KolbBotKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/KolbBot.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "KolbBotMacCLI",
            dependencies: [
                "KolbBotDiscovery",
                .product(name: "KolbBotKit", package: "KolbBotKit"),
                .product(name: "KolbBotProtocol", package: "KolbBotKit"),
            ],
            path: "Sources/KolbBotMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "KolbBotIPCTests",
            dependencies: [
                "KolbBotIPC",
                "KolbBot",
                "KolbBotDiscovery",
                .product(name: "KolbBotProtocol", package: "KolbBotKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
