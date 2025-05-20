import React, { useRef, useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";

const ZoomableImage = ({ src, alt }) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [bounds, setBounds] = useState({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  });

  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
  }));

  // Calcula límites dinámicos de movimiento
  const updateBounds = (scaleValue = 1) => {
    const container = containerRef.current;
    const img = imgRef.current;

    if (!container || !img) return;

    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const scaledWidth = img.naturalWidth * scaleValue;
    const scaledHeight = img.naturalHeight * scaleValue;

    const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
    const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);

    setBounds({
      left: -maxX,
      right: maxX,
      top: -maxY,
      bottom: maxY,
    });
  };

  // Actualiza los bounds cada vez que cambia el zoom
  useEffect(() => {
    updateBounds(scale.get()); // Solo una vez, al montar
  }, []);


  const bind = useGesture(
    {
      onPinch: ({ offset: [s] }) => {
        const clamped = Math.max(1, Math.min(4, s));
        api.start({ scale: clamped });
        updateBounds(clamped);
      },
      onWheel: ({ offset: [, sy] }) => {
        const newScale = Math.max(1, Math.min(4, 1 + sy / 300));
        api.start({ scale: newScale });
        updateBounds(newScale);
      },
      onDrag: ({ offset: [dx, dy] }) => {
        api.start({
          x: Math.max(bounds.left, Math.min(bounds.right, dx)),
          y: Math.max(bounds.top, Math.min(bounds.bottom, dy)),
        });
      },
    },
    {
      pinch: { scaleBounds: { min: 1, max: 4 }, rubberband: true },
      drag: { rubberband: false },
    }
  );

  return (
    <div
      ref={containerRef}
      style={{
        touchAction: "none",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <animated.img
        {...bind()}
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          x,
          y,
          scale,
          display: "block",
          maxWidth: "100%",
          maxHeight: "100%",
          margin: "0 auto",
          cursor: "grab",
          userSelect: "none",
        }}
      />
    </div>
  );
};

export default ZoomableImage;