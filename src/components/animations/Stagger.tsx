"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  delayChildren?: number;
  staggerChildren?: number;
  className?: string;
  viewport?: boolean;
}

export const StaggerContainer = ({
  children,
  delayChildren = 0,
  staggerChildren = 0.1,
  className = "",
  viewport = true,
}: StaggerContainerProps) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: shouldReduceMotion ? 0 : delayChildren,
        staggerChildren: shouldReduceMotion ? 0 : staggerChildren,
      },
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

export const StaggerItem = ({ children, className = "", yOffset = 20, onClick }: { children: ReactNode; className?: string; yOffset?: number; onClick?: () => void }) => {
  const shouldReduceMotion = useReducedMotion();
  
  const variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : yOffset },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={variants} className={className} onClick={onClick}>
      {children}
    </motion.div>
  );
};
