import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { fadeInUp } from '@/utils/animations';

interface AnimatedWrapperProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variants?: Variants;
  delay?: number;
  className?: string;
}

export default function AnimatedWrapper({
  children,
  variants = fadeInUp,
  delay = 0,
  className = '',
  ...props
}: AnimatedWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
