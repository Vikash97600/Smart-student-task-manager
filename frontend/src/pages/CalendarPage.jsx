import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { fetchTasks } from '../context/taskSlice';

export default function CalendarPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tasks, loading } = useSelector((state) => state.tasks);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [date, setDate] = useState(new Date());
  const [selectedDateTasks, setSelectedDateTasks] = useState([]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchTasks());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const filtered = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      const selectedDate = new Date(date);
      return (
        taskDate.getDate() === selectedDate.getDate() &&
        taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getFullYear() === selectedDate.getFullYear()
      );
    });
    setSelectedDateTasks(filtered);
  }, [date, tasks]);

  const getTileContent = ({ date: tileDate, view }) => {
    if (view === 'month') {
      const dayTasks = tasks.filter((task) => {
        if (!task.dueDate) return false;
        const td = new Date(task.dueDate);
        return td.getDate() === tileDate.getDate() && td.getMonth() === tileDate.getMonth() && td.getFullYear() === tileDate.getFullYear();
      });
      if (dayTasks.length > 0) {
        const hasOverdue = dayTasks.some((t) => t.status === 'Pending' && new Date(t.dueDate) < new Date());
        const allCompleted = dayTasks.every((t) => t.status === 'Completed');
        return (
          <div className="flex justify-center mt-0.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              hasOverdue ? 'bg-red-500 text-white' : allCompleted ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              {dayTasks.length}
            </span>
          </div>
        );
      }
    }
    return null;
  };

  const getTileClassName = ({ date: tileDate, view }) => {
    if (view === 'month') {
      const dayTasks = tasks.filter((task) => {
        if (!task.dueDate) return false;
        const td = new Date(task.dueDate);
        return td.getDate() === tileDate.getDate() && td.getMonth() === tileDate.getMonth() && td.getFullYear() === tileDate.getFullYear();
      });
      if (dayTasks.length > 0) {
        const hasOverdue = dayTasks.some((t) => t.status === 'Pending' && new Date(t.dueDate) < new Date());
        const allCompleted = dayTasks.every((t) => t.status === 'Completed');
        if (hasOverdue) return 'calendar-tile-overdue';
        if (allCompleted) return 'calendar-tile-completed';
        return 'calendar-tile-has-tasks';
      }
    }
    return '';
  };

  const isOverdue = (task) => task.status === 'Pending' && new Date(task.dueDate) < new Date();
  const getPriorityStyle = (p) => {
    switch (p) {
      case 'High': return { dot: '#ef4444', bg: 'rgba(239,68,68,0.08)', text: '#ef4444' };
      case 'Medium': return { dot: '#eab308', bg: 'rgba(234,179,8,0.08)', text: '#eab308' };
      case 'Low': return { dot: '#3b82f6', bg: 'rgba(59,130,246,0.08)', text: '#3b82f6' };
      default: return { dot: '#94a3b8', bg: 'rgba(148,163,184,0.08)', text: '#94a3b8' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Calendar</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Click a date to see your tasks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 glass rounded-2xl p-4 sm:p-6 overflow-x-auto">
          <Calendar
            onChange={setDate}
            value={date}
            tileContent={getTileContent}
            tileClassName={getTileClassName}
            className="w-full border-none"
          />
        </div>

        {/* Selected Date Tasks */}
        <div>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              📅 {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
              {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'}
            </p>

            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>No tasks for this date</p>
                <button onClick={() => navigate('/tasks/new')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25">
                  + Create Task
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {selectedDateTasks.map((task) => {
                  const ps = getPriorityStyle(task.priority);
                  return (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ x: 3 }}
                      onClick={() => navigate(`/tasks/edit/${task._id}`)}
                      className="p-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        background: isOverdue(task) ? 'rgba(239,68,68,0.06)' : task.status === 'Completed' ? 'rgba(34,197,94,0.06)' : 'rgba(59,130,246,0.04)',
                        border: `1px solid ${
                          isOverdue(task) ? 'rgba(239,68,68,0.15)' : task.status === 'Completed' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.1)'
                        }`,
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: ps.dot }} />
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-medium ${task.status === 'Completed' ? 'line-through opacity-60' : ''}`}
                            style={{ color: 'var(--text-primary)' }}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.08)', color: '#3b82f6' }}>
                              {task.subject}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: ps.bg, color: ps.text }}>
                              {task.priority}
                            </span>
                            <span className={`text-[11px] ${task.status === 'Completed' ? 'text-green-500' : isOverdue(task) ? 'text-red-500' : ''}`}
                              style={{ color: task.status === 'Completed' || isOverdue(task) ? undefined : 'var(--text-tertiary)' }}>
                              {task.status === 'Completed' ? '✅ Done' : isOverdue(task) ? '⚠️ Overdue' : '⏳ Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="glass rounded-2xl p-5 mt-4">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Legend</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">2</span>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Has tasks</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded bg-green-500" />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>All completed</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded bg-red-500" />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Overdue tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
