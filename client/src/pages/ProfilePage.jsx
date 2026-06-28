import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserIcon, KeyIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', profileForm);
      updateUser(data.user);
      toast.success('Profile updated successfully! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    setChangingPassword(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully! 🔒');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="section-title flex items-center gap-2">
        <UserIcon className="w-6 h-6 text-brand-500" />
        Profile Settings
      </h1>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-glow overflow-hidden">
              {profileForm.avatar ? (
                <img src={profileForm.avatar} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-800 flex items-center justify-center">
              <CameraIcon className="w-4 h-4 text-brand-500" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            {memberSince && <p className="text-xs text-slate-400 mt-1">Member since {memberSince}</p>}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'profile', label: 'Edit Profile', icon: UserIcon },
          { id: 'password', label: 'Change Password', icon: KeyIcon },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === id
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-brand-300'
            }`}
            id={`profile-tab-${id}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile form */}
      {tab === 'profile' && (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={saveProfile}
          className="card p-6 space-y-5"
          id="profile-edit-form"
        >
          <div>
            <label htmlFor="profile-name" className="input-label">Full Name</label>
            <input
              id="profile-name"
              name="name"
              type="text"
              value={profileForm.name}
              onChange={handleProfileChange}
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="profile-phone" className="input-label">Phone Number</label>
            <input
              id="profile-phone"
              name="phone"
              type="tel"
              value={profileForm.phone}
              onChange={handleProfileChange}
              placeholder="+91 98765 43210"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="profile-bio" className="input-label">Bio</label>
            <textarea
              id="profile-bio"
              name="bio"
              value={profileForm.bio}
              onChange={handleProfileChange}
              placeholder="Tell us about yourself..."
              className="input min-h-[80px] resize-none"
              maxLength={200}
            />
            <p className="text-xs text-slate-400 mt-1">{profileForm.bio.length}/200</p>
          </div>
          <div>
            <label htmlFor="profile-avatar" className="input-label">Avatar URL</label>
            <input
              id="profile-avatar"
              name="avatar"
              type="url"
              value={profileForm.avatar}
              onChange={handleProfileChange}
              placeholder="https://example.com/avatar.jpg"
              className="input"
            />
            {profileForm.avatar && (
              <img src={profileForm.avatar} alt="Preview" className="w-12 h-12 rounded-xl mt-2 object-cover border-2 border-brand-200" onError={(e) => { e.target.style.display = 'none'; }} />
            )}
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full" id="profile-save-btn">
            {saving ? <LoadingSpinner size="sm" /> : 'Save Changes'}
          </button>
        </motion.form>
      )}

      {/* Password form */}
      {tab === 'password' && (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={changePassword}
          className="card p-6 space-y-5"
          id="profile-password-form"
        >
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              🔒 Choose a strong password with at least 6 characters, including uppercase letters and numbers.
            </p>
          </div>
          <div>
            <label htmlFor="profile-current-password" className="input-label">Current Password</label>
            <input
              id="profile-current-password"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="profile-new-password" className="input-label">New Password</label>
            <input
              id="profile-new-password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="Min 6 characters"
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="profile-confirm-password" className="input-label">Confirm New Password</label>
            <input
              id="profile-confirm-password"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className="input"
              required
            />
            {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
          <button type="submit" disabled={changingPassword} className="btn-primary w-full" id="profile-change-password-btn">
            {changingPassword ? <LoadingSpinner size="sm" /> : 'Change Password 🔑'}
          </button>
        </motion.form>
      )}
    </div>
  );
}
