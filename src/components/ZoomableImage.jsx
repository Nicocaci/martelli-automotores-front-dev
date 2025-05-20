import { useGesture } from '@use-gesture/react';
import { useSpring, animated } from '@react-spring/web';
import { useRef } from 'react';

const ZoomableImage = ({ src }) => {
  const domTarget = useRef(null);

  const [{ scale, x, y }, api] = useSpring(() => ({
    scale: 1,
    x: 0,
    y: 0,
  }));

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  useGesture(
    {
      onPinch: ({ offset: [d], memo }) => {
        const newScale = clamp(d, 1, 3); // 🔒 limita entre 1x y 3x
        api.start({ scale: newScale });
        return memo;
      },
      onWheel: ({ delta: [, dy] }) => {
        api.start((prev) => {
          const newScale = clamp(prev.scale.get() - dy * 0.001, 1, 3);
          return { scale: newScale };
        });
      },
    },
    {
      target: domTarget,
      eventOptions: { passive: false },
      pinch: { scaleBounds: { min: 1, max: 3 }, rubberband: false },
    }
  );

  return (
    <animated.div
      ref={domTarget}
      style={{
        touchAction: 'none',
        display: 'inline-block',
        overflow: 'hidden',
        transformOrigin: 'center',
        scale,
      }}
    >
      <img
        src={src}
        alt="zoomable"
        style={{ width: '100%', height: 'auto', pointerEvents: 'none' }}
      />
    </animated.div>
  );
};
export default ZoomableImage;