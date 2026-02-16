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

  // fonte da verdade (query param)
  const isOpen = searchParams.get("bs") === "true";

  // ref atualizada para evitar stale closures no handler do drag
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const [{ y }, api] = useSpring(() => ({ y: isOpen ? 0 : RANGE }));

  const openSheet = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.set("bs", "true");
    setSearchParams(next);
  }, [setSearchParams]);

  const closeSheet = useCallback(() => {
    window.history.back();
  }, [setSearchParams]);

  useEffect(() => {
    api.set({ y: isOpen ? 0 : RANGE });
  }, []);

  // sincroniza animação quando query muda
  useEffect(() => {
    api.start({
      y: isOpen ? 0 : RANGE,
      config: { tension: 500, friction: 40 },
    });
  }, [isOpen, api]);

  // drag handler — usa isOpenRef.current para leitura consistente
  const bind = useDrag(
    ({
      first,
      last,
      movement: [, my],
      velocity: [, vy],
      direction: [, dy],
    }) => {
      if (first) {
        dragStartRef.current = y.get(); // valor REAL
      }

      const currentlyOpen = isOpenRef.current;

      if (!last) {
        // interativo: base = 0 (open) ou RANGE (closed)
        const base = currentlyOpen ? 0 : RANGE;
        api.start({ y: clamp(base + my, 0, RANGE), immediate: true });
        return;
      }

      // release: decide com critérios robustos
      const THRESHOLD = 10; // px mínimo para considerar intenção
      const midpoint = RANGE / 2;
      const finalPos = clamp((currentlyOpen ? 0 : RANGE) + my, 0, RANGE);
      const fastUp = vy > 0.6 && dy < 0;
      const fastDown = vy > 0.6 && dy > 0;

      const shouldOpen = fastUp || finalPos < midpoint - 0.5 || my < -THRESHOLD;
      const shouldClose =
        fastDown || finalPos >= midpoint + 0.5 || my > THRESHOLD;

      if (shouldOpen && !currentlyOpen) {
        openSheet();
        api.start({ y: 0, config: { tension: 500, friction: 40 } });
        return;
      }

      if (shouldClose && currentlyOpen) {
        closeSheet();
        api.start({ y: RANGE, config: { tension: 500, friction: 40 } });
        return;
      }

      // fallback: voltar ao estado atual
      api.start({
        y: currentlyOpen ? 0 : RANGE,
        config: { tension: 450, friction: 40 },
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
          backdropFilter: y.to([0, RANGE], ["blur(2px)", "blur(0px)"]),
          WebkitBackdropFilter: y.to([0, RANGE], ["blur(2px)", "blur(0px)"]),
          pointerEvents: y.to((v) => (v < RANGE - 1 ? "auto" : "none")),
        }}
        className="fixed inset-0 z-50"
        onClick={closeSheet}
      />

      <animated.div
        {...bind()}
        style={{
          transform: y.to((v) => `translateY(${v}px)`),
          touchAction: "none",
          boxShadow: y.to(
            [0, RANGE],
            [
              // aberto
              "0 -10px 20px 0 rgba(0,0,0,0.227), 0 -1px 0px 0 rgba(255,255,255,0.123)",

              // fechado (segunda sombra zerada)
              "0 -4px 8px 0 rgba(0,0,0,0.15), 0 0px 0px 0 rgba(255,255,255,0)",
            ],
          ),
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
