import { motion } from 'framer-motion';

export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  icon,
  loading = false,
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40',
    secondary: 'glass text-[var(--text-primary)] hover:bg-[var(--surface-card)]',
    ghost: 'text-[var(--text-secondary)] hover:bg-gray-500/10',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {loading ? (
        <div className="spinner spinner-sm" />
      ) : icon ? (
        <span className="text-lg">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}
