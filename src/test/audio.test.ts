import { describe, expect, it, vi } from "vitest";
import { playAudioTone } from "@/lib/audio";

describe("Web Audio Synthesizer", () => {
  it("executes safely when audio is disabled", () => {
    expect(() => playAudioTone("click", false)).not.toThrow();
    expect(() => playAudioTone("reveal", false)).not.toThrow();
    expect(() => playAudioTone("shuffle", false)).not.toThrow();
  });

  it("executes safely when window.AudioContext is mocked", () => {
    const mockOscillator = {
      type: "sine",
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn().mockReturnThis(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn().mockReturnThis(),
    };
    const mockAudioContext = vi.fn().mockImplementation(function () {
      return {
        currentTime: 0,
        destination: {},
        createOscillator: vi.fn().mockReturnValue(mockOscillator),
        createGain: vi.fn().mockReturnValue(mockGain),
        close: vi.fn().mockResolvedValue(undefined),
      };
    });

    vi.stubGlobal("AudioContext", mockAudioContext);

    expect(() => playAudioTone("click", true)).not.toThrow();
    expect(() => playAudioTone("shuffle", true)).not.toThrow();
    expect(() => playAudioTone("reveal", true)).not.toThrow();

    vi.unstubAllGlobals();
  });
});
