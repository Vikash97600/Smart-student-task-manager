import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { fetchStats } from '../context/taskSlice';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, loading, error } = useSelector((state) => state.tasks);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [animatedStats, setAnimatedStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    productivityPercentage: 0
  });
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchStats());
    }
    setTimeout(() => setAnimateIn(true), 100);
  }, [dispatch, isAuthenticated]);

  // Animate stats counting
  useEffect(() => {
    if (stats) {
      const duration = 1000;
      const steps = 20;
      const interval = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        setAnimatedStats({
          totalTasks: Math.round((stats.totalTasks || 0) * (step / steps)),
          completedTasks: Math.round((stats.completedTasks || 0) * (step / steps)),
          pendingTasks: Math.round((stats.pendingTasks || 0) * (step / steps)),
          overdueTasks: Math.round((stats.overdueTasks || 0) * (step / steps)),
          productivityPercentage: Math.round((stats.productivityPercentage || 0) * (step / steps))
        });
        
        if (step >= steps) {
          clearInterval(timer);
          setAnimatedStats({
            totalTasks: stats.totalTasks || 0,
            completedTasks: stats.completedTasks || 0,
            pendingTasks: stats.pendingTasks || 0,
            overdueTasks: stats.overdueTasks || 0,
            productivityPercentage: stats.productivityPercentage || 0
          });
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [stats]);

  const handleCardClick = (filter) => {
    // Navigate to task list with filter query params
    if (filter === 'total') {
      navigate('/tasks');
    } else if (filter === 'completed') {
      navigate('/tasks?status=Completed');
    } else if (filter === 'pending') {
      navigate('/tasks?status=Pending');
    } else if (filter === 'overdue') {
      navigate('/tasks?overdue=true');
    }
  };

  const StatCard = ({ title, value, color, filter, icon, gradient }) => (
    <div 
      onClick={() => handleCardClick(filter)}
      className={`card-hover bg-white/80 backdrop-blur-sm rounded-2xl p-6 cursor-pointer border border-white/20 shadow-lg hover:shadow-xl relative overflow-hidden group`}
      style={{ animationDelay: `${filter === 'total' ? 0 : filter === 'completed' ? 100 : filter === 'pending' ? 200 : 300}ms` }}
    >
      {/* Background decoration */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`}></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
          <p className="text-4xl font-bold mt-3" style={{ 
            color: color.includes('blue') ? '#2563eb' : color.includes('green') ? '#16a34a' : color.includes('yellow') ? '#ca8a04' : '#dc2626'
          }}>
            {value}
          </p>
        </div>
        <div className="text-5xl transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
          {icon}
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
        Click to view →
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center">
        <span className="mr-2">⚠️</span>
        {error}
      </div>
    );
  }

  const weeklyLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const weeklyData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: 'Tasks Completed',
        data: stats?.weeklyData || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: '#2563eb',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className={`transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard</h1>
        <p className="text-gray-500 mt-1">Track your progress and stay productive</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Tasks" 
          value={animatedStats.totalTasks} 
          color="border-blue-500"
          filter="total"
          icon="📋"
          gradient="bg-gradient-to-br from-blue-50 to-blue-100"
        />
        <StatCard 
          title="Completed" 
          value={animatedStats.completedTasks} 
          color="border-green-500"
          filter="completed"
          icon="✅"
          gradient="bg-gradient-to-br from-green-50 to-green-100"
        />
        <StatCard 
          title="Pending" 
          value={animatedStats.pendingTasks} 
          color="border-yellow-500"
          filter="pending"
          icon="⏳"
          gradient="bg-gradient-to-br from-yellow-50 to-yellow-100"
        />
        <StatCard 
          title="Overdue" 
          value={animatedStats.overdueTasks} 
          color="border-red-500"
          filter="overdue"
          icon="⚠️"
          gradient="bg-gradient-to-br from-red-50 to-red-100"
        />
      </div>

      {/* Productivity */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">📈 Productivity</h3>
          {stats?.streak > 0 && (
            <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1.5 rounded-full">
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-orange-600">{stats.streak} day streak!</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
            <div 
              className="progress-bar-animated h-6 rounded-full"
              style={{ width: `${animatedStats.productivityPercentage}%` }}
            ></div>
          </div>
          <span className="text-3xl font-bold text-blue-600">{animatedStats.productivityPercentage}%</span>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Weekly Progress</h3>
        <div className="h-80">
          <Bar data={weeklyData} options={options} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
