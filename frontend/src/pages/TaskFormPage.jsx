import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createTask, updateTaskAsync } from '../context/taskSlice';
import api from '../services/api';
import AnimatedButton from '../components/ui/AnimatedButton';

export default function TaskFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState({
    title: '', description: '', subject: '', dueDate: '', priority: 'Medium', status: 'Pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const fetchTask = async () => {
        try {
          const response = await api.get(`/tasks/${id}`);
          const taskData = response.data.data;
          setTask({
            ...taskData,
            dueDate: taskData.dueDate ? taskData.dueDate.split('T')[0] : '',
          });
        } catch (err) {
          setError('Failed to fetch task');
          console.error(err);
        }
      };
      fetchTask();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const taskData = { ...task, dueDate: new Date(task.dueDate).toISOString() };
      if (id) {
        dispatch(updateTaskAsync({ id, taskData }));
      } else {
        dispatch(createTask(taskData));
      }
      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/tasks" className="text-sm flex items-center gap-1.5 mb-2 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-primary)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Tasks
        </Link>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {id ? 'Edit Task' : 'Create Task'}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {id ? 'Update the details of your task' : 'Add a new task to your list'}
        </p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5 text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
          <span>⚠️</span><span>{error}</span>
        </motion.div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="glass rounded-2xl p-6 lg:p-8"
      >
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Title *</label>
            <input type="text" name="title" value={task.title} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl text-sm input-focus-ring"
              style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)', color: 'var(--text-primary)' }}
              placeholder="Enter task title" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea name="description" value={task.description} onChange={handleChange} rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm input-focus-ring resize-none"
              style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)', color: 'var(--text-primary)' }}
              placeholder="Optional task description" />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Subject *</label>
            <input type="text" name="subject" value={task.subject} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl text-sm input-focus-ring"
              style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)', color: 'var(--text-primary)' }}
              placeholder="e.g., Math, Physics, History" />
          </div>

          {/* Due Date & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Due Date *</label>
              <input type="date" name="dueDate" value={task.dueDate} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl text-sm input-focus-ring"
                style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Priority</label>
              <select name="priority" value={task.priority} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm input-focus-ring"
                style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)', color: 'var(--text-primary)' }}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Status (edit only) */}
          {id && (
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
              <select name="status" value={task.status} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm input-focus-ring"
                style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)', color: 'var(--text-primary)' }}>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200/20 dark:border-gray-700/30">
          <AnimatedButton variant="secondary" onClick={() => navigate('/tasks')} className="w-full sm:w-auto">
            Cancel
          </AnimatedButton>
          <AnimatedButton type="submit" loading={loading} icon={id ? '💾' : '✨'} className="w-full sm:w-auto">
            {id ? 'Update Task' : 'Create Task'}
          </AnimatedButton>
        </div>
      </motion.form>
    </div>
  );
}
