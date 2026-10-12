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
  Mail,
  X,
  ChevronDown,
  ChevronRight,
  Users,
  LayoutTemplate,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useTranslation } from '@/i18n';

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  nameEn: string;
  nameBn: string;
  path: string;
  icon: React.ElementType;
  permission?: string | string[];
}

interface NavGroup {
  id: string;
  titleEn: string;
  titleBn: string;
  items: NavItem[];
}

const NAVIGATION_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    titleEn: 'Overview',
    titleBn: 'সাধারণ তথ্য',
    items: [
      {
        nameEn: 'Dashboard',
        nameBn: 'ড্যাশবোর্ড',
        path: '/admin/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 'website',
    titleEn: 'Website',
    titleBn: 'ওয়েবসাইট',
    items: [
      {
        nameEn: 'Navigation Manager',
        nameBn: 'ন্যাভিগেশন মেনু',
        path: '/admin/navigation',
        icon: Compass,
        permission: 'manage_menus',
      },
      {
        nameEn: 'Homepage Builder',
        nameBn: 'হোমপেজ বিল্ডার',
        path: '/admin/homepage',
        icon: Layers,
        permission: 'manage_homepage',
      },
      {
        nameEn: 'Footer Builder',
        nameBn: 'ফুটার বিল্ডার',
        path: '/admin/footer-builder',
        icon: LayoutTemplate,
        permission: ['manage_settings', 'manage_homepage'],
      },
      {
        nameEn: 'Pages',
        nameBn: 'স্ট্যাটিক পেজ',
        path: '/admin/pages',
        icon: FileText,
        permission: 'manage_pages',
      },
      {
        nameEn: 'Site Settings',
        nameBn: 'সাইট সেটিংস',
        path: '/admin/settings',
        icon: Settings,
        permission: 'manage_settings',
      },
      {
        nameEn: 'SEO Settings',
        nameBn: 'এসইও ও রিডাইরেক্ট',
        path: '/admin/redirects',
        icon: ArrowLeftRight,
        permission: 'manage_redirects',
      },
    ],
  },
  {
    id: 'chamber',
    titleEn: 'Our Chamber',
    titleBn: 'চেম্বার পরিচয়',
    items: [
      {
        nameEn: 'About Us',
        nameBn: 'আইনজীবী পরিচিতি',
        path: '/admin/profile',
        icon: UserCheck,
        permission: 'edit_profile',
      },
    ],
  },
  {
    id: 'services',
    titleEn: 'Services',
    titleBn: 'আইনি সেবাসমূহ',
    items: [
      {
        nameEn: 'Practice Areas',
        nameBn: 'প্র্যাকটিস ক্ষেত্রসমূহ',
        path: '/admin/practice-areas',
        icon: Scale,
        permission: ['edit_practice_area', 'create_practice_area'],
      },
    ],
  },
  {
    id: 'resources',
    titleEn: 'Resources',
    titleBn: 'আইনি রিসোর্স',
    items: [
      {
        nameEn: 'Stories & Articles',
        nameBn: 'প্রকাশনা ও কলাম',
        path: '/admin/publications',
        icon: FileSpreadsheet,
        permission: ['edit_publications', 'create_publications'],
      },
      {
        nameEn: 'Research',
        nameBn: 'আইনি গবেষণা',
        path: '/admin/research',
        icon: BookOpen,
        permission: ['edit_research', 'create_research'],
      },
      {
        nameEn: 'Precedents',
        nameBn: 'সুপ্রিম কোর্ট নজির ও রায়',
        path: '/admin/judgments',
        icon: Gavel,
        permission: ['edit_judgments', 'create_judgments'],
      },
      {
        nameEn: 'Courtroom Cases',
        nameBn: 'আদালতি মোকদ্দমা',
        path: '/admin/courtroom',
        icon: Landmark,
        permission: ['edit_cases', 'create_cases'],
      },
      {
        nameEn: 'Videos',
        nameBn: 'ভিডিও ও সাক্ষাৎকার',
        path: '/admin/videos',
        icon: Video,
        permission: 'manage_videos',
      },
    ],
  },
  {
    id: 'gallery_media',
    titleEn: 'Gallery & Media',
    titleBn: 'গ্যালারি ও মিডিয়া',
    items: [
      {
        nameEn: 'Photos',
        nameBn: 'ফটো অ্যালবাম',
        path: '/admin/gallery',
        icon: Image,
        permission: 'manage_gallery',
      },
      {
        nameEn: 'Media Library',
        nameBn: 'প্রেস ও গণমাধ্যম',
        path: '/admin/media',
        icon: Newspaper,
        permission: 'manage_press',
      },
    ],
  },
  {
    id: 'communications',
    titleEn: 'Communications',
    titleBn: 'ক্লায়েন্ট যোগাযোগ',
    items: [
      {
        nameEn: 'Contact Inquiries',
        nameBn: 'সাধারণ বার্তা',
        path: '/admin/inquiries',
        icon: Mail,
        permission: 'view_contacts',
      },
      {
        nameEn: 'Consultation Requests',
        nameBn: 'অ্যাপয়েন্টমেন্ট অনুরোধ',
        path: '/admin/inquiries?tab=consultations',
        icon: MessageSquareQuote,
        permission: 'view_consultations',
      },
    ],
  },
  {
    id: 'system',
    titleEn: 'System & Security',
    titleBn: 'নিরাপত্তা ও কর্মকর্তা',
    items: [
      {
        nameEn: 'Administrators & Roles',
        nameBn: 'প্রশাসক ও অনুমতি',
        path: '/admin/users',
        icon: Users,
        permission: 'manage_users',
      },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  mobileOpen,
  onCloseMobile,
}) => {
  const { hasPermission } = useAuth();
  const { locale } = useTranslation();
  const location = useLocation();

  // Collapsed navigation groups state with persistence
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('nijam_admin_collapsed_groups');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      try {
        localStorage.setItem('nijam_admin_collapsed_groups', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const isItemActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }

    if (path.includes('?tab=')) {
      const [basePath, query] = path.split('?');
      const targetTab = new URLSearchParams(query).get('tab');
      const currentTab = new URLSearchParams(location.search).get('tab');
      return location.pathname === basePath && currentTab === targetTab;
    }

    if (path === '/admin/inquiries') {
      const currentTab = new URLSearchParams(location.search).get('tab');
      return location.pathname === '/admin/inquiries' && (!currentTab || currentTab === 'messages');
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
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
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-all flex-shrink-0 shadow-xs">
            <Scale className="w-5 h-5 text-amber-400" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <span className="block text-xs font-bold tracking-wider text-slate-100 uppercase truncate font-serif">
                NIJAM UDDIN (HAQ)
              </span>
              <span className="block text-[10px] tracking-wide text-amber-400/90 font-mono font-medium truncate">
                Chambers CMS Platform
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
        className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800"
        aria-label="Admin Navigation"
      >
        {NAVIGATION_GROUPS.map((group) => {
          // Filter items by user permission
          const visibleItems = group.items.filter((item) => {
            if (!item.permission) return true;
            return hasPermission(item.permission as any);
          });

          if (visibleItems.length === 0) return null;

          const isGroupCollapsed = collapsedGroups[group.id] ?? false;
          const groupTitle = locale === 'bn' ? group.titleBn : group.titleEn;

          return (
            <div key={group.id} className="space-y-1">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase hover:text-slate-200 transition-colors group cursor-pointer"
                >
                  <span className="truncate">{groupTitle}</span>
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
                    const itemName = locale === 'bn' ? item.nameBn : item.nameEn;

                    return (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          onClick={onCloseMobile}
                          title={collapsed ? itemName : undefined}
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
                          {!collapsed && <span className="truncate">{itemName}</span>}
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
