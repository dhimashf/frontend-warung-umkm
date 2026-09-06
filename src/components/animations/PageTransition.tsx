"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  type?: "fade" | "slide" | "content";
  className?: string;
}

export const PageTransition = ({
  children,
  type = "fade",
  className = "",
}: PageTransitionProps) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.3 } },
      exit: { opacity: 0, transition: { duration: 0.2 } },
    },
    slide: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
      exit: { opacity: 0, x: 20, transition: { duration: 0.3, ease: "easeIn" } },
    },
    content: {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
      exit: { opacity: 0, y: -10, transition: { duration: 0.1 } },
    }
  };

  const selectedVariants = shouldReduceMotion ? variants.fade : variants[type];
  if (shouldReduceMotion) {
      selectedVariants.visible.transition = { duration: 0 };
      selectedVariants.exit.transition = { duration: 0 };
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={selectedVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
