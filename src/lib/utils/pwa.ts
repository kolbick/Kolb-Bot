export function isIOS(): boolean {
	if (typeof navigator === 'undefined') {
		return false;
	}

	return (
		/iPad|iPhone|iPod/.test(navigator.userAgent) ||
		(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
	);
}

export function isStandalonePwa(): boolean {
	if (typeof window === 'undefined') {
		return false;
	}

	const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };

	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		navigatorWithStandalone.standalone === true ||
		document.referrer.startsWith('android-app://')
	);
}

/** Apply root classes used by iOS / standalone PWA styles in custom.css. */
export function initStandalonePwaClasses(): { ios: boolean; standalone: boolean } {
	const ios = isIOS();
	const standalone = isStandalonePwa();
	const root = document.documentElement;

	root.classList.toggle('ios', ios);
	root.classList.toggle('standalone', standalone);
	root.classList.toggle('ios-standalone', ios && standalone);

	return { ios, standalone };
}

/** Keep the iOS home-screen status bar readable for the active theme. */
export function updateIosStatusBarStyle(isDark: boolean): void {
	if (typeof document === 'undefined') {
		return;
	}

	let statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
	if (!statusBarMeta) {
		statusBarMeta = document.createElement('meta');
		statusBarMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
		document.head.appendChild(statusBarMeta);
	}

	statusBarMeta.setAttribute('content', isDark ? 'black-translucent' : 'default');
}
