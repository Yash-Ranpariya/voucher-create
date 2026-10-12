import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Settings, X, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../app/providers/AuthProvider';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: `/${user?.role.toLowerCase()}/dashboard` },
    { icon: FileText, label: 'Vouchers', to: `/${user?.role.toLowerCase()}/vouchers` },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 256 : 80 }}
        className={cn(
          "fixed top-0 left-0 h-screen z-30 glass border-r border-white/10 flex flex-col transition-all duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-white/10 justify-between">
          {isOpen ? (
            <h1 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">Expense<span className="text-[var(--accent-primary)]">Mgr</span></h1>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] mx-auto flex items-center justify-center font-bold text-white">E</div>
          )}
          
          <button className="md:hidden text-white/50 hover:text-white" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2.5 rounded-lg transition-colors group",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", !isOpen && "mx-auto")} />
              {isOpen && <span className="ml-3 font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Toggle Button for Desktop */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white/10 border border-white/20 items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all z-40 backdrop-blur-md"
        >
          <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", isOpen && "rotate-180")} />
        </button>
      </motion.aside>
    </>
  );
};
