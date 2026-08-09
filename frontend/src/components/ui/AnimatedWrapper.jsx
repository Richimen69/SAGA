// src/components/ui/AnimatedWrapper.jsx

import React from "react";
// 1. AnimatePresence es el "director de escena"
import { motion, AnimatePresence } from "framer-motion";

const animationVariants = {
  scaleUp: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    // 2. 'exit' define CÓMO se cierra la animación
    exit: { opacity: 0, scale: 0.95 }, 
  },
  // ... otras variantes
};

export const AnimatedWrapper = ({
  children,
  isVisible, // 3. Cuando esto se vuelve 'false', se activa la animación de 'exit'
  variant = "scaleUp",
  className,
}) => {
  const selectedVariant = animationVariants[variant] || animationVariants.scaleUp;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          initial={selectedVariant.initial} // Animación de entrada
          animate={selectedVariant.animate} // Animación de entrada
          exit={selectedVariant.exit}       // ¡AQUÍ ESTÁ LA ANIMACIÓN DE CIERRE!
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};