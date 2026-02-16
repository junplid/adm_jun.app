import { useSpring, animated, SpringRef } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useCallback, ReactNode } from "react";
import clsx from "clsx";

const MIN = 75;
const MAX = 158;
const RANGE = MAX - MIN;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function BottomSheetComponent(props: {
  children: (
    api: SpringRef<{
      y: number;
    }>,
  ) => ReactNode;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  //   const dragStartRef = useRef(0);
  const isOpen = searchParams.get("bs") === "true";

  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const [{ y }, api] = useSpring(() => {
    return { y: RANGE };
  });

  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      // 1. Bloqueia zoom (mais de 1 dedo)
      if (e.touches.length > 1) {
        e.preventDefault();
      }

      // 2. Bloqueia o reload/pull-to-refresh (se o menu estiver aberto)
      if (isOpen) {
        // O preventDefault aqui mata o comportamento nativo de puxar a página
        // Mas cuidado: isso pode travar o scroll se o conteúdo for longo.
        // Como você está usando useDrag, ele já cuida do movimento.
        e.preventDefault();
      }
    };

    // Bloqueia o gesto de zoom específico do Safari/iOS
    const handleGesture = (e: Event) => {
      e.preventDefault();
    };

    if (isOpen) {
      window.addEventListener("touchmove", handleTouch, { passive: false });
      window.addEventListener("gesturestart", handleGesture);
      window.addEventListener("gesturechange", handleGesture);
      window.addEventListener("gestureend", handleGesture);
    }

    return () => {
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("gesturestart", handleGesture);
      window.removeEventListener("gesturechange", handleGesture);
      window.removeEventListener("gestureend", handleGesture);
    };
  }, [isOpen]);

  useEffect(() => {
    api.start({
      y: isOpen ? 0 : RANGE,
      config: {
        tension: 200,
        friction: 50,
        precision: 1,
        restVelocity: 100,
        clamp: true,
      },
    });
  }, [isOpen, api]);

  const openSheet = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.set("bs", "true");
    setSearchParams(next);
  }, [setSearchParams]);

  const closeSheet = useCallback(() => {
    window.history.back();
  }, [setSearchParams]);

  const bind = useDrag(
    ({
      first,
      last,
      movement: [, my],
      velocity: [, vy],
      direction: [, dy],
      tap,
      canceled,
    }) => {
      const currentlyOpen = isOpenRef.current;
      if (first) {
        return;
      }
      if (tap) {
        return;
      }
      if (canceled) {
        alert("CANCELED");
        return api.start({ y: isOpenRef.current ? 0 : RANGE });
      }

      if (!last) {
        const base = currentlyOpen ? 0 : RANGE;
        let targetY = base + my;

        if (targetY < 0) {
          targetY = targetY * 0.7;
        }

        if (targetY > RANGE) {
          targetY = RANGE + (targetY - RANGE) * 0.7;
        }

        return api.start({ y: targetY, immediate: true });
      }

      const THRESHOLD = 20;
      const midpoint = RANGE / 2;
      const finalPos = clamp((currentlyOpen ? 0 : RANGE) + my, 0, RANGE);
      const fastUp = vy > 0.5 && dy < 0;
      const fastDown = vy > 0.5 && dy > 0;

      const shouldOpen = fastUp || finalPos < midpoint - 0.5 || my < -THRESHOLD;
      const shouldClose =
        fastDown || finalPos >= midpoint + 0.5 || my > THRESHOLD;

      if (shouldOpen && !currentlyOpen) {
        openSheet();
        return;
      }

      if (shouldClose && currentlyOpen) {
        closeSheet();
        return;
      }
      return api.start({
        y: currentlyOpen ? 0 : RANGE,
        config: {
          tension: 200,
          friction: 50,
          precision: 1,
          restVelocity: 100,
          clamp: true,
        },
      });
    },
    {
      axis: "y",
      pointer: { touch: true, capture: false },
      filterTaps: true,
      delay: 0,
      touchAction: "none",
    },
  );

  return (
    <>
      <animated.div
        {...bind()}
        style={{
          pointerEvents: isOpen ? "auto" : "none",
        }}
        className="fixed inset-0 z-50"
        onClick={(e) => {
          api.stop();
          e.stopPropagation();
          closeSheet();
        }}
      />

      <animated.div
        {...bind()}
        style={{
          transform: y.to((v) => `translateY(${v}px)`),
          willChange: "transform",
          touchAction: "none",
          userSelect: "none",
          boxShadow: "0 -1px 0px 0 rgba(255,255,255,0.123)",
          paddingBottom: 500,
          marginBottom: -500,
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          WebkitTapHighlightColor: "transparent",
        }}
        className="touch-none! select-none! fixed bottom-0 z-99 left-0 right-0 bg-[#1a1c1c] rounded-t-3xl"
      >
        <div style={{ height: MAX }}>
          <div
            className={clsx(
              "w-13 h-1 rounded-full mx-auto my-1.5 mb-1 bg-[#dadada]",
            )}
          />
          {props.children(api)}
        </div>
      </animated.div>
    </>
  );
}
