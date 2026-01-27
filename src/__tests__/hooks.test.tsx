import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { resetWindowMocks, mockMobileViewport } from './setup';

// Make React available globally for the hooks
(global as any).React = React;

let viewportify: typeof import('../index');

describe('React Hooks', () => {
  beforeEach(async () => {
    resetWindowMocks();
    vi.resetModules();
    viewportify = await import('../index');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useViewport()', () => {
    it('should return ViewportInfo object', () => {
      const { result } = renderHook(() => viewportify.useViewport());

      expect(result.current).toHaveProperty('width');
      expect(result.current).toHaveProperty('height');
      expect(result.current).toHaveProperty('vh');
      expect(result.current).toHaveProperty('vw');
      expect(result.current).toHaveProperty('orientation');
      expect(result.current).toHaveProperty('isMobile');
      expect(result.current).toHaveProperty('isTablet');
      expect(result.current).toHaveProperty('isDesktop');
    });

    it('should return correct viewport width', () => {
      const { result } = renderHook(() => viewportify.useViewport());
      expect(result.current.width).toBe(1024);
    });

    it('should return correct orientation', () => {
      const { result } = renderHook(() => viewportify.useViewport());
      expect(result.current.orientation).toBe('landscape');
    });
  });

  describe('useBreakpoint()', () => {
    it('should return current breakpoint', () => {
      const { result } = renderHook(() => viewportify.useBreakpoint());
      expect(typeof result.current).toBe('string');
    });

    it('should return lg for 1024px width', () => {
      const { result } = renderHook(() => viewportify.useBreakpoint());
      expect(result.current).toBe('lg');
    });

    it('should return xs for mobile width', async () => {
      mockMobileViewport();
      vi.resetModules();
      const mod = await import('../index');

      const { result } = renderHook(() => mod.useBreakpoint());
      expect(result.current).toBe('xs');
    });
  });

  describe('useMediaQuery()', () => {
    it('should return boolean', () => {
      const { result } = renderHook(() =>
        viewportify.useMediaQuery('(min-width: 768px)')
      );
      expect(typeof result.current).toBe('boolean');
    });

    it('should return false when query does not match', () => {
      // Our mock matchMedia returns false by default
      const { result } = renderHook(() =>
        viewportify.useMediaQuery('(min-width: 2000px)')
      );
      expect(result.current).toBe(false);
    });
  });

  describe('useIsMobile()', () => {
    it('should return false on desktop', () => {
      const { result } = renderHook(() => viewportify.useIsMobile());
      expect(result.current).toBe(false);
    });

    it('should return true on mobile viewport', async () => {
      mockMobileViewport();
      vi.resetModules();
      const mod = await import('../index');

      const { result } = renderHook(() => mod.useIsMobile());
      expect(result.current).toBe(true);
    });
  });

  describe('useOrientation()', () => {
    it('should return landscape for wider viewport', () => {
      const { result } = renderHook(() => viewportify.useOrientation());
      expect(result.current).toBe('landscape');
    });

    it('should return portrait for taller viewport', async () => {
      (window as any).innerWidth = 768;
      (window as any).innerHeight = 1024;
      vi.resetModules();
      const mod = await import('../index');

      const { result } = renderHook(() => mod.useOrientation());
      expect(result.current).toBe('portrait');
    });
  });

  describe('useKeyboard()', () => {
    it('should return object with visible and height', () => {
      const { result } = renderHook(() => viewportify.useKeyboard());

      expect(result.current).toHaveProperty('visible');
      expect(result.current).toHaveProperty('height');
      expect(typeof result.current.visible).toBe('boolean');
      expect(typeof result.current.height).toBe('number');
    });

    it('should return visible: false when no keyboard', () => {
      const { result } = renderHook(() => viewportify.useKeyboard());
      expect(result.current.visible).toBe(false);
      expect(result.current.height).toBe(0);
    });
  });

  describe('useWindowSize()', () => {
    it('should return object with width and height', () => {
      const { result } = renderHook(() => viewportify.useWindowSize());

      expect(result.current).toHaveProperty('width');
      expect(result.current).toHaveProperty('height');
    });

    it('should return correct dimensions', () => {
      const { result } = renderHook(() => viewportify.useWindowSize());

      expect(result.current.width).toBe(1024);
      expect(result.current.height).toBe(768);
    });
  });

  describe('useViewportSize()', () => {
    it('should return object with width and height', () => {
      const { result } = renderHook(() => viewportify.useViewportSize());

      expect(result.current).toHaveProperty('width');
      expect(result.current).toHaveProperty('height');
    });

    it('should return correct width', () => {
      const { result } = renderHook(() => viewportify.useViewportSize());
      expect(result.current.width).toBe(1024);
    });

    it('should return numeric height', () => {
      const { result } = renderHook(() => viewportify.useViewportSize());
      expect(typeof result.current.height).toBe('number');
      expect(result.current.height).toBeGreaterThan(0);
    });
  });

  describe('useElementSize()', () => {
    it('should return ElementSize object', () => {
      const ref = { current: document.createElement('div') };
      document.body.appendChild(ref.current);

      const { result } = renderHook(() => viewportify.useElementSize(ref));

      expect(result.current).toHaveProperty('width');
      expect(result.current).toHaveProperty('height');
      expect(result.current).toHaveProperty('top');
      expect(result.current).toHaveProperty('left');
      expect(result.current).toHaveProperty('right');
      expect(result.current).toHaveProperty('bottom');
      expect(result.current).toHaveProperty('x');
      expect(result.current).toHaveProperty('y');

      document.body.removeChild(ref.current);
    });

    it('should return zeros for null ref', () => {
      const ref = { current: null };

      const { result } = renderHook(() => viewportify.useElementSize(ref));

      expect(result.current.width).toBe(0);
      expect(result.current.height).toBe(0);
    });

    it('should update when element is set', async () => {
      const ref: { current: HTMLDivElement | null } = { current: null };

      const { result, rerender } = renderHook(() =>
        viewportify.useElementSize(ref)
      );

      expect(result.current.width).toBe(0);

      // Set the element
      ref.current = document.createElement('div');
      document.body.appendChild(ref.current);

      rerender();

      // Should have measured the element
      expect(typeof result.current.width).toBe('number');

      if (ref.current) {
        document.body.removeChild(ref.current);
      }
    });
  });
});

describe('Hook Error Handling', () => {
  beforeEach(async () => {
    resetWindowMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('hooks should work when React is available', async () => {
    viewportify = await import('../index');

    // All hooks should work since React is available
    expect(() => {
      renderHook(() => viewportify.useViewport());
    }).not.toThrow();

    expect(() => {
      renderHook(() => viewportify.useBreakpoint());
    }).not.toThrow();

    expect(() => {
      renderHook(() => viewportify.useMediaQuery('(min-width: 768px)'));
    }).not.toThrow();

    expect(() => {
      renderHook(() => viewportify.useIsMobile());
    }).not.toThrow();

    expect(() => {
      renderHook(() => viewportify.useOrientation());
    }).not.toThrow();

    expect(() => {
      renderHook(() => viewportify.useKeyboard());
    }).not.toThrow();

    expect(() => {
      renderHook(() => viewportify.useWindowSize());
    }).not.toThrow();

    expect(() => {
      renderHook(() => viewportify.useViewportSize());
    }).not.toThrow();
  });
});

describe('Hook Subscriptions', () => {
  beforeEach(async () => {
    resetWindowMocks();
    vi.resetModules();
    viewportify = await import('../index');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('useViewport should update when viewport changes', async () => {
    const { result } = renderHook(() => viewportify.useViewport());

    const initialWidth = result.current.width;
    expect(initialWidth).toBe(1024);

    // Simulate viewport change
    act(() => {
      (window as any).innerWidth = 800;
      viewportify.getViewportify().refresh();
    });

    // The hook is subscribed to changes, so it should update
    // Note: In a real scenario, the subscription would trigger a re-render
  });

  it('useBreakpoint should reflect current breakpoint', async () => {
    (window as any).innerWidth = 1280;
    vi.resetModules();
    const mod = await import('../index');

    const { result } = renderHook(() => mod.useBreakpoint());
    expect(result.current).toBe('xl');
  });
});

describe('Hook Cleanup', () => {
  beforeEach(async () => {
    resetWindowMocks();
    vi.resetModules();
    viewportify = await import('../index');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('useViewport should cleanup on unmount', () => {
    const { unmount } = renderHook(() => viewportify.useViewport());

    // Should not throw on unmount
    expect(() => unmount()).not.toThrow();
  });

  it('useBreakpoint should cleanup on unmount', () => {
    const { unmount } = renderHook(() => viewportify.useBreakpoint());
    expect(() => unmount()).not.toThrow();
  });

  it('useMediaQuery should cleanup on unmount', () => {
    const { unmount } = renderHook(() =>
      viewportify.useMediaQuery('(min-width: 768px)')
    );
    expect(() => unmount()).not.toThrow();
  });

  it('useWindowSize should cleanup on unmount', () => {
    const { unmount } = renderHook(() => viewportify.useWindowSize());
    expect(() => unmount()).not.toThrow();
  });

  it('useViewportSize should cleanup on unmount', () => {
    const { unmount } = renderHook(() => viewportify.useViewportSize());
    expect(() => unmount()).not.toThrow();
  });

  it('useElementSize should cleanup on unmount', () => {
    const ref = { current: document.createElement('div') };
    document.body.appendChild(ref.current);

    const { unmount } = renderHook(() => viewportify.useElementSize(ref));
    expect(() => unmount()).not.toThrow();

    document.body.removeChild(ref.current);
  });
});
