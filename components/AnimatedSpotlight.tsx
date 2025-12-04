import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedSpotlightProps {
  className?: string;
  fill?: string;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  duration?: number;
  delay?: number;
}

export default function AnimatedSpotlight({ 
  className = "", 
  fill = "rgba(59, 130, 246, 0.15)",
  startX = 0,
  startY = 0,
  endX = 100,
  endY = 100,
  duration = 3,
  delay = 0
}: AnimatedSpotlightProps) {
  const [position, setPosition] = useState({ x: startX, y: startY });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPosition({ x: endX, y: endY });
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [endX, endY, delay]);

  return (
    <motion.div
      className={`pointer-events-none fixed inset-0 z-30 ${className}`}
      animate={{
        background: `radial-gradient(
          800px circle at ${position.x}% ${position.y}%, 
          ${fill} 0%, 
          transparent 50%
        )`,
      }}
      transition={{
        duration: duration,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
        delay: delay,
      }}
    />
  );
}
