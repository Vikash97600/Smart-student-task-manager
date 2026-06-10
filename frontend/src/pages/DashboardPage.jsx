import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, Filler, LinearScale, Legend, Title, Tooltip } from 'chart.js';
import { fetchStats } from '../context/taskSlice';
import ProgressRing from '../components/ui/ProgressRing';
import StatCard from '../components/ui/StatCard';
import { DashboardSkeleton } from '../components/ui/SkeletonLoader';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, loading, error } = useSelector((state) => state.tasks);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [animatedStats, setAnimatedStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0, productivityPercentage: 0 });
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchStats());
    setTimeout(() => setAnimateIn(true), 100);
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (stats) {
      const duration = 1000;
      const steps = 20;
      const interval = duration / steps;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const f = step / steps;
        setAnimatedStats({
          totalTasks: Math.round((stats.totalTasks || 0) * f),
          completedTasks: Math.round((stats.completedTasks || 0) * f),
          pendingTasks: Math.round((stats.pendingTasks || 0) * f),
          overdueTasks: Math.round((stats.overdueTasks || 0) * f),
          productivityPercentage: Math.round((stats.productivityPercentage || 0) * f),
        });
        if (step >= steps) {
          clearInterval(timer);
          setAnimatedStats({
            totalTasks: stats.totalTasks || 0,
            completedTasks: stats.completedTasks || 0,
            pendingTasks: stats.pendingTasks || 0,
            overdueTasks: stats.overdueTasks || 0,
            productivityPercentage: stats.productivityPercentage || 0,
          });
        }
      }, interval);
      return () => clearInterval(timer);
    }
  }, [stats]);

  const handleCardClick = (filter) => {
    if (filter === 'total') navigate('/tasks');
    else if (filter === 'completed') navigate('/tasks?status=Completed');
    else if (filter === 'pending') navigate('/tasks?status=Pending');
    else if (filter === 'overdue') navigate('/tasks?overdue=true');
  };

  if (loading && !stats) return <DashboardSkeleton />;

  const completionRate = stats?.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const weeklyLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = {
    labels: weeklyLabels,
    datasets: [{
      label: 'Completed',
      data: stats?.weeklyData || [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: [0, 1, 2, 3, 4, 5, 6].map((i) => `rgba(59, 130, 246, ${0.5 + i * 0.07})`),
      borderColor: '#3b82f6',
      borderWidth: 0,
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const doughnutData = {
    labels: ['Completed', 'Pending', 'Overdue'],
    datasets: [{
      data: [stats?.completedTasks || 0, stats?.pendingTasks || 0, stats?.overdueTasks || 0],
      backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 }, color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 12 }, color: '#94a3b8' },
      },
    },
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  if (error) {
    return (
      <div className="p-4 rounded-xl flex items-start gap-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
        <span>⚠️</span>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {greeting}! 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Here's your productivity overview for today
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Tasks" value={animatedStats.totalTasks} icon="📋" filter="total" onClick={() => handleCardClick('total')} color="blue" delay={0} />
        <StatCard title="Completed" value={animatedStats.completedTasks} icon="✅" filter="completed" onClick={() => handleCardClick('completed')} color="green" delay={1} />
        <StatCard title="Pending" value={animatedStats.pendingTasks} icon="⏳" filter="pending" onClick={() => handleCardClick('pending')} color="yellow" delay={2} />
        <StatCard title="Overdue" value={animatedStats.overdueTasks} icon="⚠️" filter="overdue" onClick={() => handleCardClick('overdue')} color="red" delay={3} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Progress Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Weekly Progress</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Tasks completed per day</p>
            </div>
            {stats?.streak > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>
                <span>🔥</span> {stats.streak} day streak
              </motion.div>
            )}
          </div>
          <div className="h-64">
            <Bar data={weeklyData} options={chartOptions} />
          </div>
        </div>

        {/* Task Distribution */}
        <div className="glass rounded-2xl p-4 sm:p-6">
          <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Task Distribution</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>Status breakdown</p>
          <div className="h-52 flex items-center justify-center">
            {stats?.totalTasks > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Productivity Score */}
        <div className="glass rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Productivity Score</h3>              <ProgressRing percentage={animatedStats.productivityPercentage} size={100} strokeWidth={8}
            color={animatedStats.productivityPercentage > 70 ? '#22c55e' : animatedStats.productivityPercentage > 40 ? '#eab308' : '#ef4444'} label="Overall" />
        </div>

        {/* Completion Rate */}
        <div className="glass rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Completion Rate</h3>              <ProgressRing percentage={completionRate} size={100} strokeWidth={8}
            color={completionRate > 70 ? '#22c55e' : completionRate > 40 ? '#3b82f6' : '#ef4444'} label="Completed" />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 glass rounded-2xl p-4 sm:p-6">
          <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/tasks/new')}
              className="p-4 rounded-xl flex flex-col items-center gap-2 text-sm font-medium transition-all"
              style={{ background: 'rgba(59,130,246,0.08)', color: '#3b82f6' }}>
              <span className="text-2xl">➕</span> New Task
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/tasks')}
              className="p-4 rounded-xl flex flex-col items-center gap-2 text-sm font-medium transition-all"
              style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e' }}>
              <span className="text-2xl">📋</span> View Tasks
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/calendar')}
              className="p-4 rounded-xl flex flex-col items-center gap-2 text-sm font-medium transition-all"
              style={{ background: 'rgba(139,92,246,0.08)', color: '#8b5cf6' }}>
              <span className="text-2xl">📅</span> Calendar
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/report')}
              className="p-4 rounded-xl flex flex-col items-center gap-2 text-sm font-medium transition-all"
              style={{ background: 'rgba(249,115,22,0.08)', color: '#f97316' }}>
              <span className="text-2xl">📊</span> Reports
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
