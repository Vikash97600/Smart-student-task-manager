import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { fetchTasks } from '../context/taskSlice';

function CalendarPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tasks, loading } = useSelector((state) => state.tasks);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [date, setDate] = useState(new Date());
  const [selectedDateTasks, setSelectedDateTasks] = useState([]);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTasks());
    }
    setTimeout(() => setAnimateIn(true), 100);
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    // Filter tasks for the selected date
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

  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayTasks = tasks.filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.getDate() === date.getDate() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        );
      });

      if (dayTasks.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <span className="text-xs bg-blue-500 text-white px-1.5 rounded-full shadow">
              {dayTasks.length}
            </span>
          </div>
        );
      }
    }
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dayTasks = tasks.filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.getDate() === date.getDate() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        );
      });

      const hasOverdue = dayTasks.some(
        (task) =>
          task.status === 'Pending' && new Date(task.dueDate) < new Date()
      );
      const allCompleted = dayTasks.length > 0 &&
        dayTasks.every((task) => task.status === 'Completed');

      if (hasOverdue) return 'bg-red-100 rounded-full border-2 border-red-400';
      if (allCompleted) return 'bg-green-100 rounded-full border-2 border-green-400';
      if (dayTasks.length > 0) return 'bg-blue-100 rounded-full border-2 border-blue-400';
    }
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📅 Calendar View</h1>
        <p className="text-gray-500 mt-1">Click on a date to see tasks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <Calendar
              onChange={setDate}
              value={date}
              tileContent={getTileContent}
              tileClassName={getTileClassName}
              className="w-full border-none"
            />
          </div>
        </div>

        {/* Selected Date Tasks */}
        <div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📋 Tasks for {date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h2>

            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-500">No tasks for this date</p>
                <button 
                  onClick={() => navigate('/tasks/new')}
                  className="mt-4 btn-primary px-4 py-2 text-white rounded-lg text-sm"
                >
                  + Create Task
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                      task.status === 'Completed'
                        ? 'bg-green-50 border-green-200 hover:border-green-400'
                        : new Date(task.dueDate) < new Date()
                        ? 'bg-red-50 border-red-200 hover:border-red-400'
                        : 'bg-blue-50 border-blue-200 hover:border-blue-400'
                    }`}
                    onClick={() => navigate(`/tasks/edit/${task._id}`)}
                  >
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      📚 {task.subject}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          task.priority === 'High'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {task.priority === 'High' ? '🔴' : task.priority === 'Medium' ? '🟡' : '🟢'} {task.priority}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          task.status === 'Completed'
                            ? 'bg-green-200 text-green-700'
                            : 'bg-yellow-200 text-yellow-700'
                        }`}
                      >
                        {task.status === 'Completed' ? '✅' : '⏳'} {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mt-4 border border-white/20">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🎨 Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-400 rounded-full border-2 border-blue-600 flex items-center justify-center text-white text-xs font-bold">2</div>
                <span className="text-sm text-gray-600">Has tasks</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-400 rounded-full border-2 border-green-600"></div>
                <span className="text-sm text-gray-600">All tasks completed</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-red-400 rounded-full border-2 border-red-600"></div>
                <span className="text-sm text-gray-600">Overdue tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;
