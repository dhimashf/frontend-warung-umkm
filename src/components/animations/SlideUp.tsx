"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface SlideUpProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
  viewport?: boolean;
}

export const SlideUp = ({
  children,
  delay = 0,
  duration = 0.5,
  yOffset = 20,
  className = "",
  viewport = true,
}: SlideUpProps) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : yOffset },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : duration, delay: shouldReduceMotion ? 0 : delay } 
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView={viewport ? "visible" : undefined}
      animate={!viewport ? "visible" : undefined}
      viewport={{ once: true, margin: "-50px" }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
