import { motion } from 'framer-motion';

export default function StatCard({
  title,
  value,
  icon,
  color = 'blue',
  trend,
  onClick,
  delay = 0,
  subtitle,
}) {
  const colorMap = {
    blue: { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6', gradient: 'from-blue-500/20 to-blue-600/10' },
    green: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', gradient: 'from-green-500/20 to-green-600/10' },
    yellow: { bg: 'rgba(234,179,8,0.1)', text: '#eab308', gradient: 'from-yellow-500/20 to-yellow-600/10' },
    red: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', gradient: 'from-red-500/20 to-red-600/10' },
    purple: { bg: 'rgba(139,92,246,0.1)', text: '#8b5cf6', gradient: 'from-purple-500/20 to-purple-600/10' },
    orange: { bg: 'rgba(249,115,22,0.1)', text: '#f97316', gradient: 'from-orange-500/20 to-orange-600/10' },
    cyan: { bg: 'rgba(6,182,212,0.1)', text: '#06b6d4', gradient: 'from-cyan-500/20 to-cyan-600/10' },
    pink: { bg: 'rgba(236,72,153,0.1)', text: '#ec4899', gradient: 'from-pink-500/20 to-pink-600/10' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="glass rounded-2xl p-5 cursor-pointer hover:shadow-glass-hover relative overflow-hidden group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: c.text }}>
            {title}
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: c.bg }}
          >
            {icon}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <motion.div
              className="text-3xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: delay * 0.08 + 0.2 }}
            >
              {value}
            </motion.div>
            {subtitle && (
              <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {subtitle}
              </div>
            )}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
