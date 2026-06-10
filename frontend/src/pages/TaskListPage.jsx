import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { deleteTaskAsync, fetchDeletedTasks, fetchStats, fetchTasks, permanentDeleteMultipleTasksAsync, permanentDeleteTaskAsync, restoreTaskAsync, updateTaskAsync } from '../context/taskSlice';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import SearchBar from '../components/ui/SearchBar';
import { TableSkeleton, TaskCardSkeleton } from '../components/ui/SkeletonLoader';

export default function TaskListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tasks, deletedTasks, loading, error } = useSelector((state) => state.tasks);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDeletedTasks, setSelectedDeletedTasks] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [showDeleted, setShowDeleted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTasks());
      dispatch(fetchDeletedTasks());
      dispatch(fetchStats());
    }
  }, [dispatch, isAuthenticated]);

  const handleDelete = (id) => {
    setConfirmDelete(id);
  };

  const confirmDeleteAction = async () => {
    if (confirmDelete) {
      try {
        dispatch(deleteTaskAsync(confirmDelete));
        dispatch(fetchStats());
      } catch (err) { console.error('Delete error:', err); }
      setConfirmDelete(null);
    }
  };

  const handleStatusToggle = async (task) => {
    const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
    try {
      dispatch(updateTaskAsync({ id: task._id, taskData: { ...task, status: newStatus } }));
      dispatch(fetchStats());
    } catch (err) { console.error('Update error:', err); }
  };

  const handleRestore = async (id) => {
    try {
      await dispatch(restoreTaskAsync(id));
      dispatch(fetchStats());
    } catch (err) { console.error('Restore error:', err); }
  };

  const handlePermanentDelete = async (id) => {
    try {
      await dispatch(permanentDeleteTaskAsync(id));
      dispatch(fetchStats());
    } catch (err) { console.error('Permanent delete error:', err); }
  };

  const handleSelectAll = () => {
    if (selectedDeletedTasks.length === deletedTasks.length) {
      setSelectedDeletedTasks([]);
    } else {
      setSelectedDeletedTasks(deletedTasks.map((t) => t._id));
    }
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedDeletedTasks.length === 0) return;
    try {
      await dispatch(permanentDeleteMultipleTasksAsync(selectedDeletedTasks));
      setSelectedDeletedTasks([]);
      dispatch(fetchStats());
    } catch (err) { console.error('Bulk permanent delete error:', err); }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesSubject = !subjectFilter || task.subject === subjectFilter;
    const matchesPriority = !filter || task.priority === filter;
    return matchesSearch && matchesStatus && matchesSubject && matchesPriority;
  });

  const subjects = [...new Set(tasks.map((t) => t.subject))];

  const isOverdue = (task) => task.status === 'Pending' && new Date(task.dueDate) < new Date();
  const getDaysUntilDue = (task) => {
    const diff = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'High': return { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.2)', dot: '#ef4444' };
      case 'Medium': return { bg: 'rgba(234,179,8,0.1)', text: '#eab308', border: 'rgba(234,179,8,0.2)', dot: '#eab308' };
      case 'Low': return { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6', border: 'rgba(59,130,246,0.2)', dot: '#3b82f6' };
      default: return { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', border: 'rgba(148,163,184,0.2)', dot: '#94a3b8' };
    }
  };

  if (loading && tasks.length === 0) return <TableSkeleton rows={6} />;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Tasks</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            {statusFilter && <span> · {statusFilter}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex glass rounded-xl p-1">
            <button onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'list' ? 'bg-blue-500/10 text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </button>
            <button onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'grid' ? 'bg-blue-500/10 text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
            </button>
          </div>
          <Link to="/tasks/new"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all inline-flex items-center gap-2">
            <span className="text-lg leading-none">+</span> New Task
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search tasks..." />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="glass rounded-xl px-4 py-2.5 text-sm input-focus-ring" style={{ color: 'var(--text-primary)' }}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="glass rounded-xl px-4 py-2.5 text-sm input-focus-ring" style={{ color: 'var(--text-primary)' }}>
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}
            className="glass rounded-xl px-4 py-2.5 text-sm input-focus-ring" style={{ color: 'var(--text-primary)' }}>
            <option value="">All Subjects</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Task List/Grid */}
      {filteredTasks.length === 0 ? (
        <EmptyState icon="📋" title="No tasks found"
          description={search || statusFilter || filter || subjectFilter ? 'Try adjusting your filters' : 'Get started by creating your first task'}
          action={search || statusFilter || filter || subjectFilter ? undefined : () => navigate('/tasks/new')}
          actionText="Create Task" />
      ) : viewMode === 'list' ? (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="divide-y divide-gray-100/50 dark:divide-gray-700/20">
            {filteredTasks.map((task, index) => {
              const pc = getPriorityColor(task.priority);
              const days = getDaysUntilDue(task);
              return (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 hover:bg-blue-500/5 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button onClick={() => handleStatusToggle(task)}
                      className={`w-5 h-5 rounded-md mt-0.5 shrink-0 flex items-center justify-center border-2 transition-all ${
                        task.status === 'Completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }`}>
                      {task.status === 'Completed' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-sm font-semibold ${task.status === 'Completed' ? 'line-through opacity-50' : ''}`}
                          style={{ color: 'var(--text-primary)' }}>
                          {task.title}
                        </h3>
                        {/* Priority dot */}
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: pc.dot }} />
                      </div>
                      {task.description && (
                        <p className="text-xs mt-0.5 truncate max-w-lg" style={{ color: 'var(--text-tertiary)' }}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                          {task.subject}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium" style={{ background: pc.bg, color: pc.text }}>
                          {task.priority}
                        </span>
                        <span className={`text-[11px] flex items-center gap-1 ${isOverdue(task) ? 'text-red-500' : ''}`} style={{ color: isOverdue(task) ? undefined : 'var(--text-tertiary)' }}>
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                          {days > 0 && days <= 3 && <span className="text-yellow-500">({days}d left)</span>}
                          {isOverdue(task) && <span className="text-red-500">(Overdue)</span>}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/tasks/edit/${task._id}`)}
                        className="p-2 rounded-lg hover:bg-gray-500/10 transition-colors text-sm"
                        style={{ color: 'var(--text-tertiary)' }} title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(task._id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-sm text-red-400" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task, index) => {
            const pc = getPriorityColor(task.priority);
            const days = getDaysUntilDue(task);
            const completionPercent = task.status === 'Completed' ? 100 : 0;
            return (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="glass rounded-xl p-4 hover:shadow-glass-hover transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleStatusToggle(task)}
                      className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border-2 transition-all ${
                        task.status === 'Completed' ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                      {task.status === 'Completed' && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <h3 className={`text-sm font-semibold ${task.status === 'Completed' ? 'line-through opacity-50' : ''}`}
                      style={{ color: 'var(--text-primary)' }}>
                      {task.title}
                    </h3>
                  </div>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: pc.dot }} />
                </div>

                {task.description && (
                  <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>{task.description}</p>
                )}

                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                    {task.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: pc.bg, color: pc.text }}>
                    {task.priority}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full mb-3" style={{ background: 'rgba(148,163,184,0.1)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercent}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-1.5 rounded-full bg-gradient-to-r from-green-400 to-green-500"
                  />
                </div>

                <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <button onClick={() => navigate(`/tasks/edit/${task._id}`)}
                      className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-400 text-xs">Edit</button>
                    <button onClick={() => handleDelete(task._id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 text-xs">Delete</button>
                  </div>
                  <span className={`text-[10px] ${isOverdue(task) ? 'text-red-500' : ''}`} style={{ color: isOverdue(task) ? undefined : 'var(--text-tertiary)' }}>
                    {isOverdue(task) ? '⚠️ Overdue' : days === 0 ? 'Due today' : days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Recently Deleted */}
      {deletedTasks.length > 0 && (
        <div className="mt-8">
          <button onClick={() => setShowDeleted(!showDeleted)}
            className="flex items-center gap-2 text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
            <span>🗑️ Recently Deleted ({deletedTasks.length})</span>
            <svg className={`w-3.5 h-3.5 transition-transform ${showDeleted ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {showDeleted && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="glass rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/30 flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Select tasks to permanently delete
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <input type="checkbox" checked={selectedDeletedTasks.length === deletedTasks.length && deletedTasks.length > 0}
                        onChange={handleSelectAll} className="rounded" />
                      Select All
                    </label>
                    {selectedDeletedTasks.length > 0 && (
                      <button onClick={handleBulkPermanentDelete}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors">
                        Delete ({selectedDeletedTasks.length})
                      </button>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-gray-100/50 dark:divide-gray-700/20">
                  {deletedTasks.map((task) => (
                    <div key={task._id} className="p-4 flex items-center gap-3">
                      <input type="checkbox" checked={selectedDeletedTasks.includes(task._id)}
                        onChange={() => {
                          setSelectedDeletedTasks((prev) =>
                            prev.includes(task._id) ? prev.filter((id) => id !== task._id) : [...prev, task._id]
                          );
                        }} className="rounded shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                          📚 {task.subject} · 📅 {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleRestore(task._id)}
                          className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors">Restore</button>
                        <button onClick={() => handlePermanentDelete(task._id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={confirmDelete !== null} onClose={() => setConfirmDelete(null)} title="Delete Task" size="sm">
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete this task? It will be moved to recently deleted.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setConfirmDelete(null)}
            className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-500/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={confirmDeleteAction}
            className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
