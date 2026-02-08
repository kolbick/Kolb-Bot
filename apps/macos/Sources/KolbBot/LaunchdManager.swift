import Foundation

enum LaunchdManager {
    private static func runLaunchctl(_ args: [String]) {
        let process = Process()
        process.launchPath = "/bin/launchctl"
        process.arguments = args
        try? process.run()
    }

    static func startKolbBot() {
        let userTarget = "gui/\(getuid())/\(launchdLabel)"
        self.runLaunchctl(["kickstart", "-k", userTarget])
    }

    static func stopKolbBot() {
        let userTarget = "gui/\(getuid())/\(launchdLabel)"
        self.runLaunchctl(["stop", userTarget])
    }
}
