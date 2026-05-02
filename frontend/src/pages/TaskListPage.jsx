import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { fetchTasks, deleteTaskAsync, fetchStats, updateTaskAsync, fetchDeletedTasks, restoreTaskAsync, permanentDeleteTaskAsync, permanentDeleteMultipleTasksAsync } from '../context/taskSlice';

function TaskListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tasks, deletedTasks, loading, error } = useSelector((state) => state.tasks);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [search, setSearch] = useState('');
  const [animateIn, setAnimateIn] = useState(false);
  const [selectedDeletedTasks, setSelectedDeletedTasks] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTasks());
      dispatch(fetchDeletedTasks());
      dispatch(fetchStats());
    }
    // Trigger animation after mount
    setTimeout(() => setAnimateIn(true), 100);
  }, [dispatch, isAuthenticated]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        dispatch(deleteTaskAsync(id));
        dispatch(fetchStats());
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const handleStatusToggle = async (task) => {
    const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
    try {
      dispatch(updateTaskAsync({ id: task._id, taskData: { ...task, status: newStatus } }));
      dispatch(fetchStats());
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleRestore = async (id) => {
    try {
      await dispatch(restoreTaskAsync(id));
      dispatch(fetchStats());
    } catch (err) {
      console.error('Restore error:', err);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this task? This action cannot be undone.')) {
      try {
        await dispatch(permanentDeleteTaskAsync(id));
        dispatch(fetchStats());
      } catch (err) {
        console.error('Permanent delete error:', err);
      }
    }
  };

  const handleCheckboxChange = (taskId) => {
    setSelectedDeletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDeletedTasks.length === deletedTasks.length) {
      setSelectedDeletedTasks([]);
    } else {
      setSelectedDeletedTasks(deletedTasks.map(task => task._id));
    }
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedDeletedTasks.length === 0) return;
    
    if (window.confirm(`Are you sure you want to permanently delete ${selectedDeletedTasks.length} task(s)? This action cannot be undone.`)) {
      try {
        await dispatch(permanentDeleteMultipleTasksAsync(selectedDeletedTasks));
        setSelectedDeletedTasks([]);
        dispatch(fetchStats());
      } catch (err) {
        console.error('Bulk permanent delete error:', err);
      }
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesSubject = !subjectFilter || task.subject === subjectFilter;
    const matchesPriority = !filter || task.priority === filter;
    return matchesSearch && matchesStatus && matchesSubject && matchesPriority;
  });

  const subjects = [...new Set(tasks.map((task) => task.subject))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tasks</h1>
          <p className="text-gray-500 mt-1">{filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found</p>
        </div>
        <Link
          to="/tasks/new"
          className="btn-primary px-6 py-3 text-white rounded-xl font-medium flex items-center space-x-2 shadow-lg shadow-blue-500/30"
        >
          <span className="text-xl">+</span>
          <span>Add New Task</span>
        </Link>
      </div>

      {/* Filters Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {/* Status Filter */}
          <select
            className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">📋 All Status</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Completed">✅ Completed</option>
          </select>
          
          {/* Priority Filter */}
          <select
            className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">🎯 All Priorities</option>
            <option value="High">🔴 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>
          
          {/* Subject Filter */}
          <select
            className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="">📚 All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No tasks found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your filters or create a new task</p>
            <Link
              to="/tasks/new"
              className="btn-primary px-6 py-2 text-white rounded-lg inline-block"
            >
              Create Task
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  📝 Task
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  📚 Subject
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  📅 Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  🎯 Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ✅ Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ⚡ Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTasks.map((task, index) => (
                <tr 
                  key={task._id} 
                  className="table-row-hover"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {task.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <span>📅</span>
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold status-badge ${
                        task.priority === 'High'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : task.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          : 'bg-green-100 text-green-700 border border-green-200'
                      }`}
                    >
                      {task.priority === 'High' ? '🔴' : task.priority === 'Medium' ? '🟡' : '🟢'} {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleStatusToggle(task)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-110 ${
                        task.status === 'Completed'
                          ? 'bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300 hover:bg-yellow-200'
                      }`}
                    >
                      {task.status === 'Completed' ? '✅' : '⏳'} {task.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/tasks/edit/${task._id}`)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all duration-200 flex items-center space-x-1"
                      >
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-all duration-200 flex items-center space-x-1"
                      >
                        <span>🗑️</span>
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Recently Deleted</h2>
            <p className="text-sm text-gray-500 mt-1">
              {deletedTasks.length} {deletedTasks.length === 1 ? 'task' : 'tasks'} in recently deleted
            </p>
          </div>
          {deletedTasks.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={selectedDeletedTasks.length === deletedTasks.length && deletedTasks.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                Select All
              </label>
              {selectedDeletedTasks.length > 0 && (
                <button
                  onClick={handleBulkPermanentDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition flex items-center gap-2"
                >
                  <span>🗑️</span>
                  <span>Delete Selected ({selectedDeletedTasks.length})</span>
                </button>
              )}
            </div>
          )}
        </div>

        {deletedTasks.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No recently deleted tasks yet. Deleted tasks will appear here so you can restore them.
          </div>
        ) : (
          <div className="space-y-4">
            {deletedTasks.map((task) => (
              <div key={task._id} className="rounded-3xl border border-gray-200 p-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedDeletedTasks.includes(task._id)}
                      onChange={() => handleCheckboxChange(task._id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{task.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Deleted at {new Date(task.deletedAt).toLocaleString()}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="mr-2">📚 {task.subject}</span>
                        <span className="mr-2">📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRestore(task._id)}
                      className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePermanentDelete(task._id)}
                      className="px-4 py-2 rounded-full bg-red-100 text-red-600 text-sm font-semibold hover:bg-red-200 transition"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskListPage;
