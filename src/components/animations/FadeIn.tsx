"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  viewport?: boolean;
}

export const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  className = "",
  viewport = true,
}: FadeInProps) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
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
