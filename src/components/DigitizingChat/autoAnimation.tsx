"use client";

import { AutoAnimationPlugin } from "@formkit/auto-animate";

export const slideFade: AutoAnimationPlugin = (el, action) => {
  let keyframes: any[] = [];

  if (action === "add") {
    keyframes = [
      { opacity: 0, transform: "translateY(10px)" },
      { opacity: 1, transform: "translateY(0)" },
    ];
  }

  if (action === "remove") {
    keyframes = [
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0, transform: "translateY(-10px)" },
    ];
  }

  return new KeyframeEffect(el, keyframes, {
    duration: 250,
    easing: "ease-out",
    fill: "none",
  });
};
