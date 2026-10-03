import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { ScannerHUD } from "@/components/booth/ScannerHUD";

describe("ScannerHUD Stability & Zero-Recreation Invariants (T6 & T7)", () => {
  let mockGetUserMedia: ReturnType<typeof vi.fn>;
  let mockStop: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    mockStop = vi.fn();
    mockGetUserMedia = vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: mockStop }],
    });

    Object.defineProperty(navigator, "mediaDevices", {
      writable: true,
      configurable: true,
      value: { getUserMedia: mockGetUserMedia },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does NOT stop or restart camera media stream when soundEnabled toggles (T6 Invariant)", async () => {
    const onDetectCard = vi.fn();
    const onBack = vi.fn();

    const { rerender } = render(
      <ScannerHUD
        modelUrl=""
        soundEnabled={true}
        onDetectCard={onDetectCard}
        onBack={onBack}
      />,
    );

    // Initial mount calls getUserMedia once
    expect(mockGetUserMedia).toHaveBeenCalledTimes(1);
    expect(mockStop).not.toHaveBeenCalled();

    // Rerender with soundEnabled changed from true to false
    rerender(
      <ScannerHUD
        modelUrl=""
        soundEnabled={false}
        onDetectCard={onDetectCard}
        onBack={onBack}
      />,
    );

    // Stream must NOT have been stopped, and getUserMedia must NOT have been called again!
    expect(mockStop).not.toHaveBeenCalled();
    expect(mockGetUserMedia).toHaveBeenCalledTimes(1);

    // Rerender with soundEnabled changed back to true
    rerender(
      <ScannerHUD
        modelUrl=""
        soundEnabled={true}
        onDetectCard={onDetectCard}
        onBack={onBack}
      />,
    );

    expect(mockStop).not.toHaveBeenCalled();
    expect(mockGetUserMedia).toHaveBeenCalledTimes(1);
  });
});
