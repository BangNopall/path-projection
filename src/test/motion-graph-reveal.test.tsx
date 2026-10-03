import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MotionGraphReveal } from "@/components/booth/MotionGraphReveal";
import { personas } from "@/data/personas";

describe("MotionGraphReveal: 3D Spatial Coordinate Graph Transition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the 3D motion graph canvas container and node constellation", () => {
    render(
      <MotionGraphReveal persona={personas.career}>
        <div data-testid="child-content">Revealed Content</div>
      </MotionGraphReveal>,
    );

    const container = screen.getByTestId("motion-graph-3d-container");
    expect(container).toBeInTheDocument();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();

    // Contains spatial coordinate grid and data nodes
    const nodes = screen.getAllByTestId("motion-graph-node");
    expect(nodes.length).toBeGreaterThanOrEqual(6);
  });

  it("calls onComplete callback after reveal timeline completes", () => {
    const onComplete = vi.fn();
    render(
      <MotionGraphReveal persona={personas.creative} onComplete={onComplete}>
        <div>Revealed</div>
      </MotionGraphReveal>,
    );

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it("handles isSkipped mode instantly without animation delay", () => {
    const onComplete = vi.fn();
    render(
      <MotionGraphReveal persona={personas.adventure} isSkipped={true} onComplete={onComplete}>
        <div>Revealed Immediately</div>
      </MotionGraphReveal>,
    );

    expect(screen.getByText("Revealed Immediately")).toBeInTheDocument();
  });
});
