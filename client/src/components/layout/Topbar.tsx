import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, Bell, CheckCircle, Info, AlertCircle, Check } from 'lucide-react';
import { useAuth, api } from '../../app/providers/AuthProvider';
import { cn } from '../../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileModal } from '../../features/profile/ProfileModal';

export const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data.data;
    },
    refetchInterval: 30000 // poll every 30s
  });

  const markReadMutation = useMutation({
    mutationFn: async () => await api.post('/notifications/read'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: `/${user?.role.toLowerCase()}/dashboard` },
    { icon: FileText, label: 'Vouchers', to: `/${user?.role.toLowerCase()}/vouchers` },
  ];

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'DANGER': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'WARNING': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 px-4 py-3 mx-auto w-full max-w-[1600px] mt-4">
      <div className="glass flex items-center justify-between px-6 py-3 rounded-2xl shadow-xl border border-white/10 bg-slate-900/70 backdrop-blur-2xl">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">
            Expense<span className="text-[var(--accent-primary)]">Mgr</span>
          </h1>
          
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm",
                  isActive 
                    ? "bg-white/15 shadow-sm border border-white/20 text-white" 
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          
          {/* Notification Dropdown Container */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 flex flex-col"
                  >
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-semibold text-slate-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => markReadMutation.mutate()}
                          className="text-xs font-medium text-[var(--accent-primary)] hover:text-blue-700 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notif: any) => (
                          <div 
                            key={notif.id}
                            onClick={() => {
                              setShowNotifications(false);
                              if (notif.link) navigate(notif.link);
                            }}
                            className={cn(
                              "p-4 border-b border-slate-50 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors",
                              !notif.is_read ? "bg-blue-50/30" : ""
                            )}
                          >
                            <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 mb-0.5">{notif.title}</p>
                              <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                              <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">
                                {new Date(notif.created_at).toLocaleString()}
                              </p>
                            </div>
                            {!notif.is_read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 ml-auto mt-1" />}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-white/10 mx-2" />

          {/* User Profile Button Trigger */}
          <button 
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/10 transition-all text-left group"
            title="View & Edit Profile Details"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                {user?.name}
              </p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-300 uppercase tracking-wider">
                  {user?.role}
                </span>
                {user?.signature_url && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Signature verified" />
                )}
              </div>
            </div>
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-sm font-bold shadow-md border border-white/20 group-hover:scale-105 group-hover:border-blue-400 transition-all">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
          </button>

          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors ml-1"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User Profile Details & Signature Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </header>
  );
};
