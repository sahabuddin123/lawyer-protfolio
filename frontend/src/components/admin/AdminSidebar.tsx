import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  FileText,
  Compass,
  Layers,
  ArrowLeftRight,
  UserCheck,
  Scale,
  Landmark,
  BookOpen,
  Gavel,
  FileSpreadsheet,
  Newspaper,
  Video,
  Image,
  MessageSquareQuote,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  permission?: string | string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAVIGATION_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Website Management',
    items: [
      { name: 'Site Settings', path: '/admin/settings', icon: Settings, permission: 'manage_settings' },
      { name: 'Static Pages', path: '/admin/pages', icon: FileText, permission: 'manage_pages' },
      { name: 'Navigation Menus', path: '/admin/navigation', icon: Compass, permission: 'manage_menus' },
      { name: 'Homepage Sections', path: '/admin/homepage', icon: Layers, permission: 'manage_homepage' },
      { name: 'URL Redirects', path: '/admin/redirects', icon: ArrowLeftRight, permission: 'manage_redirects' },
    ],
  },
  {
    title: 'Lawyer Profile',
    items: [
      { name: 'Advocate Profile', path: '/admin/profile', icon: UserCheck, permission: 'edit_profile' },
      { name: 'Practice Areas', path: '/admin/practice-areas', icon: Scale, permission: ['edit_practice_area', 'create_practice_area'] },
    ],
  },
  {
    title: 'Legal Content',
    items: [
      { name: 'Courtroom Cases', path: '/admin/courtroom', icon: Landmark, permission: ['edit_cases', 'create_cases'] },
      { name: 'Legal Research', path: '/admin/research', icon: BookOpen, permission: ['edit_research', 'create_research'] },
      { name: 'Landmark Judgments', path: '/admin/judgments', icon: Gavel, permission: ['edit_judgments', 'create_judgments'] },
      { name: 'Publications', path: '/admin/publications', icon: FileSpreadsheet, permission: ['edit_publications', 'create_publications'] },
    ],
  },
  {
    title: 'Media Library',
    items: [
      { name: 'Media & Press', path: '/admin/media', icon: Newspaper, permission: ['edit_media', 'create_media'] },
      { name: 'Video Archive', path: '/admin/videos', icon: Video, permission: ['edit_videos', 'create_videos'] },
      { name: 'Photo Gallery', path: '/admin/gallery', icon: Image, permission: ['edit_gallery', 'create_gallery'] },
    ],
  },
  {
    title: 'Client Services',
    items: [
      { name: 'Inquiries & Consultations', path: '/admin/inquiries', icon: MessageSquareQuote, permission: 'view_inquiries' },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  mobileOpen,
  onCloseMobile,
}) => {
  const { hasPermission } = useAuth();
  const location = useLocation();

  // Track expanded groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isItemActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
        <NavLink
          to="/admin/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group min-w-0"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-all flex-shrink-0">
            <Scale className="w-5 h-5 text-amber-400" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <span className="block text-xs font-bold tracking-wider text-slate-100 uppercase truncate font-serif">
                NIJAM UDDIN (HAQ)
              </span>
              <span className="block text-[10px] tracking-wide text-amber-400/90 font-mono font-medium truncate">
                Judicial CMS & Back-Office
              </span>
            </div>
          )}
        </NavLink>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer"
          aria-label="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800"
        aria-label="Admin Navigation"
      >
        {NAVIGATION_GROUPS.map((group) => {
          // Filter items by user permission
          const visibleItems = group.items.filter((item) => {
            if (!item.permission) return true;
            return hasPermission(item.permission as any);
          });

          if (visibleItems.length === 0) return null;

          const isGroupCollapsed = collapsedGroups[group.title] ?? false;

          return (
            <div key={group.title} className="space-y-1">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase hover:text-slate-200 transition-colors group cursor-pointer"
                >
                  <span>{group.title}</span>
                  <span className="text-slate-600 group-hover:text-slate-400">
                    {isGroupCollapsed ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </button>
              )}

              {(!isGroupCollapsed || collapsed) && (
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active = isItemActive(item.path);
                    const IconComponent = item.icon;

                    return (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          onClick={onCloseMobile}
                          title={collapsed ? item.name : undefined}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                            active
                              ? 'bg-slate-800 text-amber-400 font-semibold shadow-xs border-l-2 border-amber-400'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          }`}
                        >
                          <IconComponent
                            className={`w-4 h-4 flex-shrink-0 transition-colors ${
                              active
                                ? 'text-amber-400'
                                : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                          {!collapsed && <span className="truncate">{item.name}</span>}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-medium">Console v2.6</span>
          </div>
          <span className="font-mono text-[10px] text-amber-400/80">Supreme Court Bar</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out border-r border-slate-800 ${
          collapsed ? 'w-18' : 'w-64'
        }`}
      >
        {content}
      </aside>

      {/* Mobile Drawer (Off-Canvas with Backdrop) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-in-left">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
