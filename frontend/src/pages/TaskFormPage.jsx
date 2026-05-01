import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createTask, updateTaskAsync } from '../context/taskSlice';
import api from '../services/api';

function TaskFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 100);
    
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
    setTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const taskData = {
        ...task,
        dueDate: new Date(task.dueDate).toISOString(),
      };

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
    <div className={`transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Link 
            to="/tasks" 
            className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
          >
            ← Back to Tasks
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">
          {id ? '✏️ Edit Task' : '➕ Create New Task'}
        </h1>
        <p className="text-gray-500 mt-1">
          {id ? 'Update task details below' : 'Fill in the details to create a new task'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center">
          <span className="mr-2">⚠️</span>
          {error}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Title *
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={task.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              📄 Description
            </label>
            <textarea
              id="description"
              name="description"
              value={task.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 resize-none"
              placeholder="Enter task description (optional)"
            ></textarea>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
              📚 Subject *
            </label>
            <input
              id="subject"
              type="text"
              name="subject"
              value={task.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
              placeholder="e.g., Math, Physics, English, History"
            />
          </div>

          {/* Due Date & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Due Date *
              </label>
              <input
                id="dueDate"
                type="date"
                name="dueDate"
                value={task.dueDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                🎯 Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={task.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
              >
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>
          </div>

          {/* Status (only for edit) */}
          {id && (
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                ✅ Status
              </label>
              <select
                id="status"
                name="status"
                value={task.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
              >
                <option value="Pending">⏳ Pending</option>
                <option value="Completed">✅ Completed</option>
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
          >
            <span>🚪</span>
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-3 text-white rounded-xl font-medium flex items-center space-x-2 shadow-lg shadow-blue-500/30 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="spinner w-5 h-5"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>{id ? '💾' : '✨'}</span>
                <span>{id ? 'Update Task' : 'Create Task'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskFormPage;
