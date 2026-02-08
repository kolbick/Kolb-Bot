// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "KolbBotKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
    ],
    products: [
        .library(name: "KolbBotProtocol", targets: ["KolbBotProtocol"]),
        .library(name: "KolbBotKit", targets: ["KolbBotKit"]),
        .library(name: "KolbBotChatUI", targets: ["KolbBotChatUI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/steipete/ElevenLabsKit", exact: "0.1.0"),
        .package(url: "https://github.com/gonzalezreal/textual", exact: "0.3.1"),
    ],
    targets: [
        .target(
            name: "KolbBotProtocol",
            path: "Sources/KolbBotProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "KolbBotKit",
            dependencies: [
                "KolbBotProtocol",
                .product(name: "ElevenLabsKit", package: "ElevenLabsKit"),
            ],
            path: "Sources/KolbBotKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "KolbBotChatUI",
            dependencies: [
                "KolbBotKit",
                .product(
                    name: "Textual",
                    package: "textual",
                    condition: .when(platforms: [.macOS, .iOS])),
            ],
            path: "Sources/KolbBotChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "KolbBotKitTests",
            dependencies: ["KolbBotKit", "KolbBotChatUI"],
            path: "Tests/KolbBotKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
