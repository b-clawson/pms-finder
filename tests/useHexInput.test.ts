import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';

// We dynamically import useHexInput in tests that need a clean module-level cache.
// The module keeps a `swatchCache` singleton — once populated it's reused across tests.

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useHexInput', () => {
  it('starts with defaults when no initial value', async () => {
    const { useHexInput } = await import('../src/app/hooks/useHexInput');
    const { result } = renderHook(() => useHexInput());

    expect(result.current.hexInput).toBe('');
    expect(result.current.previewColor).toBe('#FF6A00');
    expect(result.current.isValid).toBe(true);
    expect(result.current.resolvedFromPms).toBeNull();
    expect(result.current.resolving).toBe(false);
  });

  it('accepts an initial hex value', async () => {
    const { useHexInput } = await import('../src/app/hooks/useHexInput');
    const { result } = renderHook(() => useHexInput('#FF0000'));

    expect(result.current.hexInput).toBe('#FF0000');
    expect(result.current.previewColor).toBe('#FF0000');
    expect(result.current.isValid).toBe(true);
    expect(result.current.normalizedHex).toBe('#FF0000');
  });

  it('validates 6-digit hex without hash', async () => {
    const { useHexInput } = await import('../src/app/hooks/useHexInput');
    const { result } = renderHook(() => useHexInput('ABCDEF'));

    expect(result.current.isValid).toBe(true);
    expect(result.current.previewColor).toBe('#ABCDEF');
    expect(result.current.normalizedHex).toBe('#ABCDEF');
  });

  it('validates 3-digit hex shorthand', async () => {
    const { useHexInput } = await import('../src/app/hooks/useHexInput');
    const { result } = renderHook(() => useHexInput('F0A'));

    expect(result.current.isValid).toBe(true);
    expect(result.current.previewColor).toBe('#F0A');
  });

  it('updates when setHexInput is called', async () => {
    const { useHexInput } = await import('../src/app/hooks/useHexInput');
    const { result } = renderHook(() => useHexInput());

    act(() => {
      result.current.setHexInput('#00FF00');
    });

    expect(result.current.hexInput).toBe('#00FF00');
    expect(result.current.previewColor).toBe('#00FF00');
    expect(result.current.isValid).toBe(true);
  });

  it('resets to defaults on empty input', async () => {
    const { useHexInput } = await import('../src/app/hooks/useHexInput');
    const { result } = renderHook(() => useHexInput('#FF0000'));

    act(() => {
      result.current.setHexInput('');
    });

    expect(result.current.previewColor).toBe('#FF6A00');
    expect(result.current.isValid).toBe(true);
    expect(result.current.resolvedFromPms).toBeNull();
  });
});

describe('useHexInput PMS resolution', () => {
  // Each test in this describe block gets a fresh module to avoid swatchCache bleed
  beforeEach(() => {
    vi.resetModules();
  });

  it('resolves a PMS code via fetch', async () => {
    const mockSwatches = [
      { pms: '185', series: 'C', hex: '#E4002B', name: '185 C', notes: '' },
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ swatches: mockSwatches }),
    } as Response);

    const { useHexInput } = await import('../src/app/hooks/useHexInput');
    const { result } = renderHook(() => useHexInput());

    act(() => {
      result.current.setHexInput('185 C');
    });

    await vi.waitFor(() => {
      expect(result.current.resolving).toBe(false);
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.resolvedFromPms).toEqual({
      name: '185 C',
      hex: '#E4002B',
    });
    expect(result.current.previewColor).toBe('#E4002B');
    expect(result.current.normalizedHex).toBe('#E4002B');
  });

  it('marks invalid for non-matching PMS input', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ swatches: [] }),
    } as Response);

    const { useHexInput } = await import('../src/app/hooks/useHexInput');
    const { result } = renderHook(() => useHexInput());

    act(() => {
      result.current.setHexInput('ZZZZ');
    });

    await vi.waitFor(() => {
      expect(result.current.resolving).toBe(false);
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.resolvedFromPms).toBeNull();
  });
});
