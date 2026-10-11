import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  Languages,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';
import { useAuth } from '@/features/auth/AuthContext';
import { useTranslation } from '@/i18n';

interface AdminHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
  onOpenMobileSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  sidebarCollapsed,
  onToggleSidebarCollapse,
  onOpenMobileSidebar,
}) => {
  const { user, logout } = useAuth();
  const { locale, setLocale } = useTranslation();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } catch {
      navigate('/admin/login', { replace: true });
    }
  };

  const userInitials = (user?.name || 'Admin')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 shadow-xs flex items-center justify-between px-4 sm:px-6">
      {/* Left: Sidebar Toggles & Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleSidebarCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-slate-600" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-slate-500" />
          )}
        </button>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* Breadcrumb Hierarchy */}
        <div className="min-w-0 flex-1">
          <AdminBreadcrumbs />
        </div>
      </div>

      {/* Right: Quick Tools, Language Switcher & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Live Website Preview Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70 transition-colors"
          title="Open live website in a new tab"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          <span>View Live Site</span>
        </a>

        {/* Language Selector Dropdown */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setLangDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70 transition-colors cursor-pointer"
            aria-label="Change Language"
          >
            <Languages className="w-3.5 h-3.5 text-amber-600" />
            <span className="uppercase font-semibold tracking-wider">{locale}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-fade-in text-xs">
              <button
                type="button"
                onClick={() => {
                  setLocale('en');
                  setLangDropdownOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors ${
                  locale === 'en'
                    ? 'bg-amber-50/70 text-amber-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>English</span>
                {locale === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocale('bn');
                  setLangDropdownOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors ${
                  locale === 'bn'
                    ? 'bg-amber-50/70 text-amber-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>বাংলা</span>
                {locale === 'bn' && <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />}
              </button>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100 text-left transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            aria-label="User Profile Menu"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shadow-xs border border-amber-400/30">
              {userInitials}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-semibold text-slate-800 leading-tight">
                {user?.name || 'Advocate Admin'}
              </span>
              <span className="block text-[10px] text-slate-500 font-medium">
                {user?.roles?.[0] || 'Super Administrator'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in text-xs">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {user?.name || 'Advocate Nijam Uddin'}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100/80 text-amber-800 border border-amber-200/60">
                    <ShieldCheck className="w-3 h-3 text-amber-700" />
                    {user?.roles?.[0] || 'Super Admin'}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/admin/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Advocate Profile</span>
                </Link>

                <Link
                  to="/admin/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  <span>Site Configuration</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out of Console</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
