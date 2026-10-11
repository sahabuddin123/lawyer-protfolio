import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Settings,
  FileText,
  Compass,
  Layers,
  ArrowLeftRight,
  Sparkles,
} from 'lucide-react';
import { SettingsManager } from './SettingsManager';
import { PagesManager } from './PagesManager';
import { NavigationManager } from './NavigationManager';
import { HomepageManager } from './HomepageManager';
import { RedirectsManager } from './RedirectsManager';
import { ProfileManager } from '@/features/profile';
import { PracticeAreasManager } from '@/features/practice-areas';
import { CourtroomManager } from '@/features/courtroom';
import { ResearchManager } from '@/features/research';
import { JudgmentManager } from '@/features/judgments';
import { PublicationManager } from '@/features/publications';
import { MediaManager } from '@/features/media';
import { VideosManager } from '@/features/videos';
import { GalleryManager } from '@/features/gallery';
import { ContactInboxManager } from '@/features/contact';
import { AdminContent, AdminPageHeader } from '@/components/admin';
import { useAuth } from '@/features/auth/AuthContext';

export const CmsAdminDashboard: React.FC = () => {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active module resolved from query param or defaults to 'settings'
  const activeModule = searchParams.get('module') || 'settings';

  const handleSelectModule = (mod: string) => {
    setSearchParams({ module: mod });
  };

  const primaryCmsModules = [
    {
      id: 'settings',
      label: 'Site Settings',
      description: 'Brand, SEO, and contact parameters',
      icon: Settings,
      permission: 'manage_settings',
    },
    {
      id: 'pages',
      label: 'Static Pages',
      description: 'Institutional briefs & policy pages',
      icon: FileText,
      permission: 'manage_pages',
    },
    {
      id: 'navigation',
      label: 'Navigation Menus',
      description: 'Header, footer, and drawer links',
      icon: Compass,
      permission: 'manage_menus',
    },
    {
      id: 'homepage',
      label: 'Homepage Sections',
      description: 'Section ordering, titles & visibility',
      icon: Layers,
      permission: 'manage_homepage',
    },
    {
      id: 'redirects',
      label: 'URL Redirects',
      description: 'SEO redirects & canonical 301/302 rules',
      icon: ArrowLeftRight,
      permission: 'manage_redirects',
    },
  ];

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'settings':
        return <SettingsManager />;
      case 'pages':
        return <PagesManager />;
      case 'navigation':
        return <NavigationManager />;
      case 'homepage':
        return <HomepageManager />;
      case 'redirects':
        return <RedirectsManager />;
      case 'profile':
        return <ProfileManager />;
      case 'practice_areas':
        return <PracticeAreasManager />;
      case 'courtroom':
        return <CourtroomManager />;
      case 'research':
        return <ResearchManager />;
      case 'judgments':
        return <JudgmentManager />;
      case 'publications':
        return <PublicationManager />;
      case 'media':
        return <MediaManager />;
      case 'videos':
        return <VideosManager />;
      case 'gallery':
        return <GalleryManager />;
      case 'inquiries':
        return <ContactInboxManager />;
      default:
        return <SettingsManager />;
    }
  };

  return (
    <AdminContent wide>
      <AdminPageHeader
        title="Content Management Console"
        description="Unified administration workspace for website configuration, structured CMS pages, navigation taxonomies, and judicial assets."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Core CMS</span>
          </span>
        }
      />

      {/* Module Selector Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-2 mb-6">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
          {primaryCmsModules.map((mod) => {
            if (mod.permission && !hasPermission(mod.permission as any)) {
              return null;
            }

            const IconComponent = mod.icon;
            const isActive = activeModule === mod.id;

            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleSelectModule(mod.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-amber-400 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <IconComponent
                  className={`w-4 h-4 ${
                    isActive ? 'text-amber-400' : 'text-slate-400'
                  }`}
                />
                <span>{mod.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Module Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 lg:p-8">
        {renderActiveModule()}
      </div>
    </AdminContent>
  );
};
