import { useSpring, animated } from "@react-spring/web";
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

export function BottomSheetComponent(props: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const dragStartRef = useRef(0);
  const isOpen = searchParams.get("bs") === "true";

  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const [{ y }, api] = useSpring(() => {
    return { y: RANGE };
  });

  useEffect(() => {
    api.start({
      y: isOpen ? 0 : RANGE,
      config: { tension: 900, friction: 35 },
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

      if (tap || canceled) {
        return;
      }
      if (first) {
        dragStartRef.current = y.get();
      }
      //   if (!last) {
      //     const base = currentlyOpen ? 0 : RANGE;
      //     api.start({ y: clamp(base + my, 0, RANGE), immediate: true });
      //     return;
      //   }

      if (!last) {
        const base = currentlyOpen ? 0 : RANGE;
        let targetY = base + my;

        if (targetY < 0) {
          targetY = targetY * 0.3;
        }

        if (targetY > RANGE) {
          targetY = RANGE + (targetY - RANGE) * 0.3;
        }

        api.start({ y: targetY, immediate: true });
        return;
      }

      const THRESHOLD = 10;
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

      api.start({
        y: currentlyOpen ? 0 : RANGE,
        config: { tension: 900, friction: 35 },
      });
    },
    {
      axis: "y",
      pointer: { touch: true },
      filterTaps: true,
    },
  );

  return (
    <>
      <animated.div
        style={{
          backgroundColor: y.to(
            [0, RANGE],
            ["rgba(0,0,0,0.15)", "rgba(0,0,0,0)"],
          ),
          pointerEvents: isOpen ? "auto" : "none",
        }}
        className="fixed inset-0 z-50"
        onClick={closeSheet}
      />

      <animated.div
        {...bind()}
        style={{
          transform: y.to((v) => `translateY(${v}px)`),
          touchAction: "none",
          boxShadow: "0 -1px 0px 0 rgba(255,255,255,0.123)",
          paddingBottom: 500,
          marginBottom: -500,
        }}
        className="touch-none! select-none! fixed bottom-0 z-99 left-0 right-0 bg-[#1a1c1c] rounded-t-3xl"
      >
        <div style={{ height: MAX }}>
          <div
            className={clsx(
              isOpen ? "bg-[#dadada]" : "bg-[#4f4e4e]",
              "w-13 h-1 rounded-full mx-auto my-1.5 mb-1",
            )}
          />
          {props.children}
        </div>
      </animated.div>
    </>
  );
}
