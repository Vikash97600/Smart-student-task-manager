import { motion } from 'framer-motion';

export default function EmptyState({ icon, title, description, action, actionText }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 flex items-center justify-center text-4xl mb-5"
      >
        {icon || '📋'}
      </motion.div>
      <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        {title || 'Nothing here yet'}
      </h3>
      <p className="text-sm mb-6 text-center max-w-xs" style={{ color: 'var(--text-tertiary)' }}>
        {description || 'Get started by creating your first item.'}
      </p>
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
        >
          {actionText || 'Create'}
        </motion.button>
      )}
    </motion.div>
  );
}
