'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Building2,
  GitCompare,
  Copy,
  Bell,
  BarChart3,
  Settings,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Sliders,
  Search,
} from 'lucide-react';
import { dataStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';

const G = {
  sidebar:     '#0d0d0f',
  sidebarBdr:  'rgba(255,255,255,0.08)',
  navActive:   'rgba(255,255,255,0.12)',
  navHover:    'rgba(255,255,255,0.06)',
  topbar:      'rgba(255,255,255,0.85)',
  topbarBdr:   '#e5e5ea',
  mainBg:      '#f5f5f7',
  textPrimary: '#f5f5f7',
  textSecond:  'rgba(255,255,255,0.6)',
  textTertiary:'rgba(255,255,255,0.35)',
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isDemoMode,
    isDataLoading,
    dataError,
    dataVersion,
    logout,
    retryDataLoad,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const metrics = dataStore.getDashboardMetrics();
  const alerts = dataStore.getAlerts();
  const unreadAlerts = alerts.filter((a) => !a.is_read);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    if (await logout()) setLogoutConfirmOpen(false);
  };

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/auth/callback' ||
    pathname === '/session-expired' ||
    pathname === '/access-denied';

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Don't render app shell while unauthenticated (redirect happening)
  if (!isAuthenticated || isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <div
          className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white/80 animate-spin"
          style={{ animationDuration: '0.8s' }}
        />
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f5f5f7] px-6 text-center">
        <h1 className="text-lg font-semibold text-neutral-900">Unable to load dashboard data</h1>
        <p className="max-w-xl text-sm text-neutral-600">{dataError}</p>
        <button
          type="button"
          onClick={() => void retryDataLoad()}
          className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentUser = user || dataStore.getCurrentUser();

  const navItems = [
    { label: 'Dashboard',           href: '/',                   icon: LayoutDashboard },
    { label: 'Complaints & Cases',  href: '/cases',              icon: FileText,    count: metrics.total },
    { label: 'Institutions',        href: '/institutions',       icon: Building2 },
    { label: 'Institution Queue',   href: '/institutions/queue', icon: ShieldCheck, count: metrics.pendingResolution, alert: metrics.pendingResolution > 0 },
    { label: 'Overlap Center',      href: '/overlaps',           icon: GitCompare,  count: metrics.openOverlaps,      alert: metrics.openOverlaps > 0 },
    { label: 'Duplicate Reviews',   href: '/duplicates',         icon: Copy,        count: metrics.openDuplicates },
    { label: 'Alerts & SLA',        href: '/alerts',             icon: Bell,        count: unreadAlerts.length },
    { label: 'Reports',             href: '/reports',            icon: BarChart3 },
    { label: 'Administration',      href: '/admin',              icon: Settings },
  ];

  const initials = currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0d0d0f]">

      {/* ── Mobile Top Bar ── */}
      <div
        className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-50 bg-[#0d0d0f] border-b border-white/10 text-white"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black tracking-tight bg-white/10 border border-white/20 text-white"
          >
            TR
          </div>
          <span className="font-semibold text-sm tracking-wide text-white">TRAC-AICTE</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-white/70 hover:text-white transition"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Sidebar (macOS Dark/Charcoal) ── */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-60 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          background: G.sidebar,
          borderRight: `1px solid ${G.sidebarBdr}`,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          <Link
            href="/"
            className="px-4 py-4 flex items-center gap-3 transition-colors border-b border-white/10"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black tracking-tighter flex-shrink-0 bg-white/10 border border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.06)]"
            >
              TR
            </div>
            <div>
              <div className="text-xs font-bold tracking-wide text-white">TRAC-AICTE</div>
              <div className="text-[10px] tracking-wider text-white/60">Grievance Intelligence</div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-0.5">
            <div
              className="px-3 py-2 text-[9px] font-bold tracking-[0.18em] uppercase text-white/60"
            >
              Surveillance
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: isActive ? G.navActive : 'transparent',
                    border: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                    color: isActive ? G.textPrimary : G.textSecond,
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = G.navHover; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.45)' }}
                    />
                    <span className={isActive ? 'font-semibold text-white' : ''}>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: item.alert ? '#ffffff' : 'rgba(255,255,255,0.12)',
                        color: item.alert ? '#000000' : 'rgba(255,255,255,0.7)',
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-white/10">
          <div className="mb-1.5 px-1 text-[9px] font-bold tracking-[0.15em] uppercase text-white/60">
            {isDemoMode ? 'Demo Session' : 'Signed-in Account'}
          </div>
          <div className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-white">
            <div className="truncate text-[11px] font-semibold">{currentUser.name}</div>
            <div className="mt-0.5 truncate text-[10px] capitalize text-white/60">
              {currentUser.role.replace('_', ' ')} {currentUser.bureau_code ? `· ${currentUser.bureau_code}` : ''}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area (Apple Light Grey / White Theme) ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f5f5f7]">

        {/* ── Topbar (Translucent Light Glass) ── */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-white/80 border-b border-neutral-200/80 backdrop-blur-xl"
        >
          {/* Global Search Bar */}
          <div
            className="relative flex items-center rounded-xl px-3 py-1.5 w-64 md:w-80 bg-white border border-neutral-200 shadow-2xs transition-all focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-200"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search cases, institutions, IDs… (↵)"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && globalSearch.trim()) {
                  router.push(`/cases?search=${encodeURIComponent(globalSearch.trim())}`);
                }
              }}
              className="bg-transparent text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none w-full"
            />
          </div>

          {/* Right actions: Alerts popover & User profile */}
          <div className="flex items-center gap-2">
            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl transition text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                aria-label="Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadAlerts.length > 0 && (
                  <span
                    className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center bg-black text-white"
                  >
                    {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-2xl py-2 z-50 bg-white border border-neutral-200 shadow-xl backdrop-blur-2xl"
                >
                  <div
                    className="px-4 py-2.5 flex items-center justify-between border-b border-neutral-100"
                  >
                    <span className="text-xs font-bold text-neutral-900">Surveillance Alerts</span>
                    <Link
                      href="/alerts"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[10px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      View All →
                    </Link>
                  </div>
                  <div className="divide-y divide-neutral-100 max-h-64 overflow-y-auto">
                    {alerts.slice(0, 5).map((alt) => (
                      <div
                        key={alt.id}
                        className="px-4 py-3 transition-colors hover:bg-neutral-50 cursor-pointer"
                        onClick={() => {
                          setNotificationsOpen(false);
                          router.push('/alerts');
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-[9px] font-bold uppercase tracking-widest text-neutral-800"
                          >
                            {alt.type.replace('_', ' ')}
                          </span>
                          <span className="text-[9px] text-neutral-400">
                            {new Date(alt.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] line-clamp-2 text-neutral-600">
                          {alt.message}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 text-center border-t border-neutral-100">
                    <Link
                      href="/alerts"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[10px] font-semibold text-neutral-600 hover:text-neutral-900"
                    >
                      Open Alerts Center →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Popover */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-neutral-100 transition-all focus:outline-none cursor-pointer"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 bg-neutral-900 text-white shadow-2xs"
                >
                  {initials}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[11px] font-semibold leading-tight text-neutral-900">{currentUser.name}</p>
                  <p className="text-[9px] capitalize leading-tight text-neutral-500">{currentUser.role.replace('_', ' ')}</p>
                </div>
                <ChevronDown className="w-3 h-3 hidden lg:block text-neutral-400" />
              </button>

              {profileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl py-1.5 z-50 bg-white border border-neutral-200 shadow-xl text-neutral-900"
                >
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-xs font-semibold text-neutral-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 font-semibold uppercase">
                        {currentUser.role.replace('_', ' ')}
                      </span>
                      {currentUser.bureau_code && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 font-mono font-semibold">
                          {currentUser.bureau_code}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                      Official Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                      Surveillance Settings
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-neutral-100">
                    <button
                      onClick={() => { setProfileMenuOpen(false); setLogoutConfirmOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-neutral-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Main Authenticated Page Content ── */}
        <main
          key={dataVersion}
          className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto text-neutral-900"
        >
          {children}

          {/* Institutional Footer */}
          <footer className="mt-16 pt-6 border-t border-neutral-200 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-700">TRAC-AICTE</span>
              <span>·</span>
              <span>Technical Redressal &amp; Approval Council</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <Link href="/privacy" className="hover:text-neutral-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-neutral-900 transition-colors">
                Terms &amp; Conditions
              </Link>
              <span className="text-neutral-400">v0.1 Pre-Launch</span>
            </div>
          </footer>
        </main>
      </div>

      {/* ── Sign-out Confirmation Modal ── */}
      {logoutConfirmOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 bg-white border border-neutral-200 shadow-2xl animate-fade-in-up text-neutral-900"
          >
            <h3 className="text-base font-bold mb-1 text-neutral-900 tracking-tight">End Session?</h3>
            <p className="text-xs leading-relaxed mb-6 text-neutral-500">
              You will be returned to the sign-in terminal and your session will end.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition cursor-pointer shadow-xs active:scale-[0.98]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
