import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../context/authSlice';
import { userService } from '../services/api';
import AnimatedButton from '../components/ui/AnimatedButton';

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', avatar: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '', avatar: user.avatar || '' });
    }
  }, [user]);

  const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await userService.updateProfile(profileForm);
      if (response.success) {
        dispatch(updateUserProfile(response.data));
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally { setLoading(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setPasswordLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally { setPasswordLoading(false); }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/dashboard')}
          className="text-sm flex items-center gap-1.5 mb-2 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-primary)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Manage your account details</p>
      </div>

      {message.text && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={`mb-5 p-3.5 rounded-xl flex items-start gap-2.5 text-sm ${
            message.type === 'success'
              ? 'text-green-400' : 'text-red-400'
          }`}
          style={{ background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: message.type === 'success' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)' }}>
          <span>{message.type === 'success' ? '✅' : '❌'}</span>
          <span>{message.text}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Personal Information</h2>
              <button onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ color: 'var(--color-primary)', background: 'rgba(59,130,246,0.08)' }}>
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-xl overflow-hidden shrink-0">
                    {profileForm.avatar ? (
                      <img src={profileForm.avatar} alt="" className="w-full h-full object-cover" />
                    ) : getInitials(profileForm.name)}
                  </div>
                  {isEditing && (
                    <input type="text" name="avatar" value={profileForm.avatar} onChange={handleProfileChange}
                      placeholder="Avatar URL"
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm input-focus-ring"
                      style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)', color: 'var(--text-primary)' }} />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                  <input type="text" name="name" value={profileForm.name} onChange={handleProfileChange} disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-xl text-sm input-focus-ring disabled:opacity-60"
                    style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
                  <input type="email" name="email" value={profileForm.email} disabled
                    className="w-full px-4 py-2.5 rounded-xl text-sm opacity-60 cursor-not-allowed"
                    style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)', color: 'var(--text-primary)' }} />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Email cannot be changed</p>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6">
                  <AnimatedButton type="submit" loading={loading} variant="primary">
                    Save Changes
                  </AnimatedButton>
                </div>
              )}
            </form>
          </motion.div>

          {/* Change Password */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 lg:p-8">
            <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Current Password</label>
                <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} required
                  className="w-full px-4 py-2.5 rounded-xl text-sm input-focus-ring"
                  style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)', color: 'var(--text-primary)' }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                  <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} required minLength={6}
                    className="w-full px-4 py-2.5 rounded-xl text-sm input-focus-ring"
                    style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</label>
                  <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required minLength={6}
                    className="w-full px-4 py-2.5 rounded-xl text-sm input-focus-ring"
                    style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <AnimatedButton type="submit" loading={passwordLoading} variant="primary">
                Change Password
              </AnimatedButton>
            </form>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Account Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Member Since</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Last Login</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Account Type</p>
                <p className="text-sm font-medium mt-0.5 capitalize" style={{ color: 'var(--text-primary)' }}>{user?.role || 'User'}</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))' }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>💡 Tip</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Keep your profile information up to date for a personalized experience. You can change your avatar, name, and password at any time.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
