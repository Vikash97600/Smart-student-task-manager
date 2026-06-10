import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  padding = 'p-6',
  onClick,
  glow = false,
  style,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={`
        glass rounded-2xl ${padding} 
        ${hover ? 'cursor-pointer hover:shadow-glass-hover' : ''} 
        ${glow ? 'ring-1 ring-blue-500/20' : ''}
        ${className}
      `}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
}
