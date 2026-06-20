'use client';

import { useStore } from '@/store/store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  ShieldCheck, 
  HeartPulse, 
  FileText, 
  ClipboardList, 
  Calendar, 
  Warehouse, 
  AlertOctagon, 
  Settings, 
  LogOut, 
  Clock, 
  CalendarDays,
  Menu,
  X
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useStore((state) => state.user);
  const userRole = useStore((state) => state.userRole);
  const logout = useStore((state) => state.logout);
  const [currentTime, setCurrentTime] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Time updater
  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      };
      setCurrentTime(new Date().toLocaleDateString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Secure checkout
  useEffect(() => {
    if (!user || !userRole) {
      router.push('/login');
    }
  }, [user, userRole, router]);

  if (!user || !userRole) return null;

  // Build navigation items based on user roles
  const getSidebarItems = (): SidebarItem[] => {
    const common = [
      { name: 'Global Search', href: '/search', icon: <Activity className="h-5 w-5" /> }
    ];

    if (userRole === 'admin') {
      return [
        { name: 'Admin Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
        { name: 'Patient Directory', href: '/patients', icon: <Users className="h-5 w-5" /> },
        { name: 'Staff Management', href: '/staff', icon: <Stethoscope className="h-5 w-5" /> },
        { name: 'Room Occupancy', href: '/rooms', icon: <Warehouse className="h-5 w-5" /> },
        { name: 'Medicine Catalog', href: '/medicines', icon: <ClipboardList className="h-5 w-5" /> },
        { name: 'Appointments', href: '/appointments', icon: <Calendar className="h-5 w-5" /> },
        { name: 'Compliance Audits', href: '/audit', icon: <ShieldCheck className="h-5 w-5" /> },
        ...common
      ];
    }

    if (userRole === 'doctor') {
      return [
        { name: 'Doctor Dashboard', href: '/dashboard/doctor', icon: <LayoutDashboard className="h-5 w-5" /> },
        { name: 'My Patients', href: '/patients', icon: <Users className="h-5 w-5" /> },
        { name: 'Appointments', href: '/appointments', icon: <Calendar className="h-5 w-5" /> },
        { name: 'Medical Records', href: '/medical-records', icon: <FileText className="h-5 w-5" /> },
        { name: 'Clinical AI Hub', href: '/ai-assistant', icon: <Settings className="h-5 w-5" /> },
        ...common
      ];
    }

    if (userRole === 'nurse') {
      return [
        { name: 'Nurse Dashboard', href: '/dashboard/nurse', icon: <LayoutDashboard className="h-5 w-5" /> },
        { name: 'Patient Vitals', href: '/patients', icon: <Users className="h-5 w-5" /> },
        { name: 'Ward Tasks', href: '/tasks', icon: <ClipboardList className="h-5 w-5" /> },
        { name: 'Appointments', href: '/appointments', icon: <Calendar className="h-5 w-5" /> },
        { name: 'Medical Records', href: '/medical-records', icon: <FileText className="h-5 w-5" /> },
        ...common
      ];
    }

    // Patient
    return [
      { name: 'My Patient Portal', href: '/dashboard/patient', icon: <LayoutDashboard className="h-5 w-5" /> },
      { name: 'Appointments', href: '/appointments', icon: <Calendar className="h-5 w-5" /> }
    ];
  };

  const menuItems = getSidebarItems();

  const handleLogoutClick = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 glass-panel border-r border-slate-200/80 bg-white/80 shrink-0">
        
        {/* Branding */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-100">
          <div className="bg-cyan-600 p-1.5 rounded-lg text-white">
            <Activity className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-slate-800 tracking-tight">SehatSetu</span>
          <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full capitalize">
            {userRole}
          </span>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center font-bold text-cyan-700 uppercase">
              {user.name?.slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <span className="text-sm font-bold text-slate-700 block truncate">{user.name}</span>
              <span className="text-[10px] text-slate-400 block truncate">{user.email || user.contactNumber}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  active 
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/10' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogoutClick}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>

      </aside>

      {/* Mobile Drawer (Overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/40 backdrop-blur-sm">
          <div className="w-64 bg-white flex flex-col h-full animate-fade-in-up">
            <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-600" />
                <span className="font-bold text-slate-800">SehatSetu</span>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">{user.name}</span>
              <span className="text-[10px] text-slate-400 block capitalize">{userRole} profile</span>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
              {menuItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      active ? 'bg-cyan-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleLogoutClick}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200/80 shrink-0">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            
            {/* Dashboard Context Header title */}
            <h1 className="hidden sm:block text-sm font-bold text-slate-700 capitalize">
              {userRole} Portal &bull; <span className="font-medium text-slate-400">{user.department || 'Hospital'}</span>
            </h1>
          </div>

          {/* Date, Time & Shift Display */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            
            {/* Nurse Shift Badge */}
            {userRole === 'nurse' && user.shift && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse">
                <Clock className="h-3.5 w-3.5" />
                <span className="capitalize">{user.shift} Shift Duty</span>
              </div>
            )}

            {/* Date Info */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <CalendarDays className="h-3.5 w-3.5 text-cyan-600" />
              <span>{currentTime || 'Synchronizing Clinician Metrics...'}</span>
            </div>

          </div>

        </header>

        {/* Page Inner Content */}
        <main className="flex-1 overflow-y-auto p-6 focus:outline-none relative">
          {children}
        </main>

      </div>

    </div>
  );
}
