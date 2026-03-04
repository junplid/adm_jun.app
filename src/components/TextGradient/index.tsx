"use client";

import { FC, ReactNode } from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export const TextGradientComponent: FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <motion.span
      className={twMerge(clsx("bg-clip-text text-transparent", className))}
      style={{
        backgroundImage: "linear-gradient(70deg, #00ff62, #77ffab, #00ff62)",
        backgroundSize: "600% 400%",
      }}
      animate={{
        backgroundPositionX: ["0%", "100%"],
      }}
      transition={{
        duration: 4,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      }}
    >
      {children}
    </motion.span>
  );
};
