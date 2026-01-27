import { vi } from 'vitest';

// Remove ontouchstart to simulate non-touch device by default
delete (window as any).ontouchstart;

// Mock window properties
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  configurable: true,
  value: 1,
});

// Mock screen
Object.defineProperty(window, 'screen', {
  writable: true,
  configurable: true,
  value: {
    width: 1920,
    height: 1080,
  },
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  writable: true,
  configurable: true,
  value: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    platform: 'MacIntel',
    maxTouchPoints: 0,
  },
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock visualViewport
Object.defineProperty(window, 'visualViewport', {
  writable: true,
  configurable: true,
  value: {
    width: 1024,
    height: 768,
    offsetLeft: 0,
    offsetTop: 0,
    pageLeft: 0,
    pageTop: 0,
    scale: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock getComputedStyle
window.getComputedStyle = vi.fn().mockImplementation(() => ({
  top: '0px',
  right: '0px',
  bottom: '0px',
  left: '0px',
}));

// Helper to reset mocks between tests
export function resetWindowMocks() {
  (window as any).innerWidth = 1024;
  (window as any).innerHeight = 768;
  (window as any).devicePixelRatio = 1;
  (window as any).navigator = {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    platform: 'MacIntel',
    maxTouchPoints: 0,
  };
  // Ensure ontouchstart is not defined for non-touch devices
  delete (window as any).ontouchstart;
}

// Helper to mock iOS device
export function mockIOSDevice() {
  (window as any).navigator = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    platform: 'iPhone',
    maxTouchPoints: 5,
  };
}

// Helper to mock Android device
export function mockAndroidDevice() {
  (window as any).navigator = {
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36',
    platform: 'Linux armv8l',
    maxTouchPoints: 5,
  };
}

// Helper to mock Safari browser
export function mockSafariBrowser() {
  (window as any).navigator = {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15',
    platform: 'MacIntel',
    maxTouchPoints: 0,
  };
}

// Helper to mock mobile viewport
export function mockMobileViewport() {
  (window as any).innerWidth = 375;
  (window as any).innerHeight = 812;
}

// Helper to mock tablet viewport
export function mockTabletViewport() {
  (window as any).innerWidth = 768;
  (window as any).innerHeight = 1024;
  (window as any).navigator = {
    ...window.navigator,
    maxTouchPoints: 5,
  };
}
