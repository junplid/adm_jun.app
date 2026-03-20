"use client";

import { Easing, motion, MotionProps } from "framer-motion";
import { FC, ReactNode } from "react";
import { useInView } from "react-intersection-observer";

type AnimationType = "top" | "bottom" | "left" | "right" | "fade" | "scale";

interface FadeAnimationProps {
  children?: ReactNode;
  render?: (inView: boolean) => ReactNode;
  duration?: number;

  /** Reexecuta animação ao sair e voltar */
  reanimate?: boolean;

  threshold?: number;
  delay?: number;

  ease?: Easing;

  /** Tipo da animação */
  animation?: AnimationType;
}

const animationVariants: Record<
  AnimationType,
  {
    initial: MotionProps["initial"];
    animate: MotionProps["animate"];
  }
> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  top: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
  },
  bottom: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  left: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  right: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
  },
};

export const FadeAnimationComponent: FC<FadeAnimationProps> = ({
  children,
  reanimate = false,
  threshold = 0.3,
  delay = 0,
  duration = 0.3,
  animation = "bottom",
  ease = "easeOut",
  render,
}) => {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: !reanimate,
  });

  const { initial, animate } = animationVariants[animation];

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? animate : reanimate ? initial : undefined}
      transition={{
        duration,
        ease,
        delay,
      }}
    >
      {children || render?.(inView)}
    </motion.div>
  );
};
