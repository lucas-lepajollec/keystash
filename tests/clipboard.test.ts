import { describe, it, expect, vi, afterEach } from 'vitest';
import { copyToClipboard } from '../src/lib/clipboard';

describe('copyToClipboard', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false for empty text', async () => {
    const res = await copyToClipboard('');
    expect(res).toBe(false);
  });

  it('uses navigator.clipboard.writeText when available', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        clipboard: {
          writeText: mockWriteText,
        },
      },
      configurable: true,
      writable: true,
    });

    const success = await copyToClipboard('my-secret-key');
    expect(success).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith('my-secret-key');
  });

  it('falls back to execCommand when navigator.clipboard is undefined (HTTP non-secure context)', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {}, // No clipboard property in non-secure HTTP context
      configurable: true,
      writable: true,
    });

    const mockExecCommand = vi.fn().mockReturnValue(true);
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();

    Object.defineProperty(globalThis, 'document', {
      value: {
        createElement: () => ({
          style: {},
          setAttribute: vi.fn(),
          focus: vi.fn(),
          select: vi.fn(),
          value: '',
        }),
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
        execCommand: mockExecCommand,
      },
      configurable: true,
      writable: true,
    });

    const success = await copyToClipboard('my-lan-secret');
    expect(success).toBe(true);
    expect(mockExecCommand).toHaveBeenCalledWith('copy');
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
  });
});
