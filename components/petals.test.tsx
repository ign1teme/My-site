import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Petals } from './petals';

const route = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));

describe('browsing animation lifecycle', () => {
  let frames: Map<number, FrameRequestCallback>;
  let frameId: number;
  let context: Record<string, ReturnType<typeof vi.fn>>;
  beforeEach(() => {
    route.pathname = '/';
    frames = new Map(); frameId = 0;
    context = Object.fromEntries(['setTransform', 'clearRect', 'save', 'translate', 'rotate', 'scale', 'beginPath', 'moveTo', 'bezierCurveTo', 'lineTo', 'fill', 'restore'].map(name => [name, vi.fn()]));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => frames.delete(id)));
  });
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it.each(['/blog/an-article', '/novel/sodoma/001'])('keeps reading pages free of animated canvas: %s', pathname => {
    route.pathname = pathname;
    const view = render(<Petals />);
    expect(view.container.querySelector('canvas')).toBeNull();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('honors reduced motion and works without canvas support', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const reduced = render(<Petals />);
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    reduced.unmount();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    render(<Petals />);
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('draws, resizes, pauses in hidden tabs and releases work on unmount', () => {
    const view = render(<Petals />);
    const canvas = view.container.querySelector('canvas')!;
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
    expect(canvas.width).toBeGreaterThan(0);
    const callback = frames.values().next().value!;
    act(() => callback(performance.now() + 20));
    expect(context.fill).toHaveBeenCalled();
    vi.stubGlobal('innerWidth', 400);
    act(() => window.dispatchEvent(new Event('resize')));
    expect(canvas.width).toBe(400 * Math.min(window.devicePixelRatio || 1, 2));
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    const beforePause = vi.mocked(requestAnimationFrame).mock.calls.length;
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(requestAnimationFrame).toHaveBeenCalledTimes(beforePause);
    hidden.mockReturnValue(false);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(requestAnimationFrame).toHaveBeenCalledTimes(beforePause + 1);
    view.unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
    const afterUnmount = vi.mocked(requestAnimationFrame).mock.calls.length;
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(requestAnimationFrame).toHaveBeenCalledTimes(afterUnmount);
    expect(context.clearRect).toHaveBeenCalled();
  });
});
