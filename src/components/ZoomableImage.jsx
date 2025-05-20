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
    onPinch: ({ offset: [scaleValue] }) => {
      api.start({ scale: scaleValue });
    },
    onDrag: ({ offset: [dx, dy] }) => {
      api.start({ x: dx, y: dy });
    },
    onWheel: ({ offset: [, sy] }) => {
      const newScale = Math.max(1, Math.min(4, 1 + sy / 300));
      api.start({ scale: newScale });
    },
  }, {
    pinch: { scaleBounds: { min: 1, max: 4 }, rubberband: true },
    drag: { bounds: { left: -300, right: 300, top: -300, bottom: 300 }, rubberband: true },
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