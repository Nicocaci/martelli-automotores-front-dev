import React from "react";
import { useSpring, animated } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";

const ZoomableImage = ({ src, alt }) => {
  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
  }));

  const bind = useGesture({
    onPinch: ({ offset: [d] }) => {
      api.start({ scale: d / 200 });
    },
    onDrag: ({ offset: [dx, dy] }) => {
      api.start({ x: dx, y: dy });
    },
    onWheel: ({ offset: [, sy] }) => {
      api.start({ scale: 1 + sy / 300 });
    },
  }, {
    pinch: { scaleBounds: { min: 1, max: 4 }, rubberband: true },
    drag: { bounds: { left: -200, right: 200, top: -200, bottom: 200 }, rubberband: true },
  });

  return (
    <div style={{ touchAction: "none", overflow: "hidden" }}>
      <animated.img
        {...bind()}
        src={src}
        alt={alt}
        style={{
          x,
          y,
          scale,
          display: "block",
          maxWidth: "100%",
          margin: "0 auto",
          cursor: "grab",
        }}
      />
    </div>
  );
};

export default ZoomableImage;