import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
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
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/AuthContext';

export const CmsAdminDashboard: React.FC = () => {
  const { user, hasPermission, logout } = useAuth();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<'settings' | 'pages' | 'navigation' | 'homepage' | 'redirects' | 'profile' | 'practice_areas' | 'courtroom' | 'research' | 'judgments' | 'publications' | 'media' | 'videos' | 'gallery' | 'inquiries'>('settings');

  return (
    <div className="min-h-screen bg-black text-neutral-100 py-8">
      <Container size="wide" className="space-y-6">
        {/* Judicial Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-legal-gold/20 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono tracking-widest text-legal-gold uppercase">
                Judicial Back-Office
              </span>
              <span className="text-xs text-neutral-600">•</span>
              <span className="text-xs font-mono text-neutral-400">Phase 5 CMS Foundation</span>
            </div>
            <h1 className="text-3xl font-serif text-white tracking-wide mt-1">
              Platform Content & Settings Administration
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3 bg-neutral-900 px-4 py-2 rounded border border-neutral-800">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-xs">
                <span className="text-white font-medium">{user?.name || 'Administrator'}</span>
                <span className="text-neutral-500 block font-mono">
                  {user?.roles?.join(', ') || 'Staff'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/admin/login', { replace: true });
              }}
              className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-red-400 rounded border border-neutral-800 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* CMS Module Tabs */}
        <div className="flex flex-wrap gap-2">
          {hasPermission('manage_settings') && (
            <button
              type="button"
              onClick={() => setActiveModule('settings')}
              className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                activeModule === 'settings'
                  ? 'bg-legal-gold text-black shadow-lg shadow-legal-gold/10 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              ⚙ Site Settings
            </button>
          )}

          {hasPermission('manage_pages') && (
            <button
              type="button"
              onClick={() => setActiveModule('pages')}
              className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                activeModule === 'pages'
                  ? 'bg-legal-gold text-black shadow-lg shadow-legal-gold/10 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              📄 Static Pages
            </button>
          )}

          {hasPermission('manage_menus') && (
            <button
              type="button"
              onClick={() => setActiveModule('navigation')}
              className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                activeModule === 'navigation'
                  ? 'bg-legal-gold text-black shadow-lg shadow-legal-gold/10 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              🧭 Navigation Menus
            </button>
          )}

          {hasPermission('manage_homepage') && (
            <button
              type="button"
              onClick={() => setActiveModule('homepage')}
              className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                activeModule === 'homepage'
                  ? 'bg-legal-gold text-black shadow-lg shadow-legal-gold/10 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              🏛 Homepage Sections
            </button>
          )}

          {hasPermission('manage_redirects') && (
            <button
              type="button"
              onClick={() => setActiveModule('redirects')}
              className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                activeModule === 'redirects'
                  ? 'bg-legal-gold text-black shadow-lg shadow-legal-gold/10 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              🔀 URL Redirects
            </button>
          )}

          {hasPermission('edit_profile') && (
            <button
              type="button"
              onClick={() => setActiveModule('profile')}
              className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                activeModule === 'profile'
                  ? 'bg-legal-gold text-black shadow-lg shadow-legal-gold/10 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              👤 Advocate Profile
            </button>
          )}

          {(hasPermission('edit_practice_area') || hasPermission('create_practice_area')) && (
            <button
              type="button"
              onClick={() => setActiveModule('practice_areas')}
              className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                activeModule === 'practice_areas'
                  ? 'bg-legal-gold text-black shadow-lg shadow-legal-gold/10 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              ⚖ Practice Areas
            </button>
          )}

          {(hasPermission('edit_cases') || hasPermission('create_cases')) && (
            <button
              type="button"
              onClick={() => setActiveModule('courtroom')}
              className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                activeModule === 'courtroom'
                  ? 'bg-legal-gold text-black shadow-lg shadow-legal-gold/10 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              🏛 Courtroom Cases
            </button>
          )}

          {(hasPermission('edit_research') || hasPermission('create_research')) && (
            <button
              type="button"
              onClick={() => setActiveModule('research')}
              className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                activeModule === 'research'
                  ? 'bg-legal-gold text-black shadow-lg shadow-legal-gold/10 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              📚 Legal Research
            </button>
          )}

          {(hasPermission('edit_judgments') || hasPermission('create_judgments')) && (
            <button
              type="button"
              onClick={() => setActiveModule('judgments')}
              className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                activeModule === 'judgments'
                  ? 'bg-legal-gold text-black shadow-lg shadow-legal-gold/10 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              ⚖ Landmark Judgments
            </button>
          )}

          {(hasPermission('edit_publications') || hasPermission('create_publications')) && (
            <button
              type="button"
              onClick={() => setActiveModule('publications')}
              className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                activeModule === 'publications'
                  ? 'bg-legal-gold text-black shadow-lg shadow-legal-gold/10 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              📖 Publications
            </button>
          )}

          {(hasPermission('manage_press') || hasPermission('manage_appearances')) && (
            <button
              type="button"
              onClick={() => setActiveModule('media')}
              className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                activeModule === 'media'
                  ? 'bg-legal-gold text-black shadow-lg shadow-legal-gold/10 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              🎙 Media & Press
            </button>
          )}

          {hasPermission('manage_videos') && (
            <button
              type="button"
              onClick={() => setActiveModule('videos')}
              className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                activeModule === 'videos'
                  ? 'bg-legal-gold text-black shadow-lg shadow-legal-gold/10 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              🎥 Video Archive
            </button>
          )}

          {hasPermission('manage_gallery') && (
            <button
              type="button"
              onClick={() => setActiveModule('gallery')}
              className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                activeModule === 'gallery'
                  ? 'bg-legal-gold text-black shadow-lg shadow-legal-gold/10 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              🖼 Photo Gallery
            </button>
          )}

          {(hasPermission('view_contacts') || hasPermission('view_consultations') || hasPermission('manage_contacts') || hasPermission('manage_consultations')) && (
            <button
              type="button"
              onClick={() => setActiveModule('inquiries')}
              className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                activeModule === 'inquiries'
                  ? 'bg-legal-gold text-black shadow-lg shadow-legal-gold/10 font-semibold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              ✉ Inquiries & Consultations
            </button>
          )}
        </div>

        {/* Active Module Content */}
        <Card className="p-6 bg-neutral-950 border border-neutral-800 shadow-2xl">
          {activeModule === 'settings' && <SettingsManager />}
          {activeModule === 'pages' && <PagesManager />}
          {activeModule === 'navigation' && <NavigationManager />}
          {activeModule === 'homepage' && <HomepageManager />}
          {activeModule === 'redirects' && <RedirectsManager />}
          {activeModule === 'profile' && <ProfileManager />}
          {activeModule === 'practice_areas' && <PracticeAreasManager />}
          {activeModule === 'courtroom' && <CourtroomManager />}
          {activeModule === 'research' && <ResearchManager />}
          {activeModule === 'judgments' && <JudgmentManager />}
          {activeModule === 'publications' && <PublicationManager />}
          {activeModule === 'media' && <MediaManager />}
          {activeModule === 'videos' && <VideosManager />}
          {activeModule === 'gallery' && <GalleryManager />}
          {activeModule === 'inquiries' && <ContactInboxManager />}
        </Card>
      </Container>
    </div>
  );
};

