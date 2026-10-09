import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { HomePage } from '@/pages/HomePage';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { AdminContent } from '@/components/admin';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';

// Route Fallback during lazy loading
const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-background-primary py-24">
    <LoadingSpinner size="lg" label="Loading Judicial Content..." />
  </div>
);

const AdminPageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center py-24">
    <LoadingSpinner size="lg" label="Loading Back-Office Module..." />
  </div>
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const withAdminSuspense = (Component: React.ComponentType, wide = true) => (
  <Suspense fallback={<AdminPageLoader />}>
    <AdminContent wide={wide}>
      <Component />
    </AdminContent>
  </Suspense>
);

// Lazy-loaded Public Pages
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const PracticeAreasPage = lazy(() =>
  import('@/pages/PracticeAreasPage').then((m) => ({ default: m.PracticeAreasPage }))
);
const PracticeAreaDetailPage = lazy(() =>
  import('@/pages/PracticeAreaDetailPage').then((m) => ({ default: m.PracticeAreaDetailPage }))
);
const CourtroomPage = lazy(() =>
  import('@/pages/CourtroomPage').then((m) => ({ default: m.CourtroomPage }))
);
const CourtroomDetailPage = lazy(() =>
  import('@/pages/CourtroomDetailPage').then((m) => ({ default: m.CourtroomDetailPage }))
);
const JudgmentsPage = lazy(() =>
  import('@/pages/JudgmentsPage').then((m) => ({ default: m.JudgmentsPage }))
);
const JudgmentDetailPage = lazy(() =>
  import('@/pages/JudgmentDetailPage').then((m) => ({ default: m.JudgmentDetailPage }))
);
const ResearchPage = lazy(() =>
  import('@/pages/ResearchPage').then((m) => ({ default: m.ResearchPage }))
);
const ResearchDetailPage = lazy(() =>
  import('@/pages/ResearchDetailPage').then((m) => ({ default: m.ResearchDetailPage }))
);
const PublicationsPage = lazy(() =>
  import('@/pages/PublicationsPage').then((m) => ({ default: m.PublicationsPage }))
);
const PublicationDetailPage = lazy(() =>
  import('@/pages/PublicationDetailPage').then((m) => ({ default: m.PublicationDetailPage }))
);
const MediaPage = lazy(() => import('@/pages/MediaPage').then((m) => ({ default: m.MediaPage })));
const MediaDetailPage = lazy(() =>
  import('@/pages/MediaDetailPage').then((m) => ({ default: m.MediaDetailPage }))
);
const VideosPage = lazy(() => import('@/pages/VideosPage').then((m) => ({ default: m.VideosPage })));
const VideoDetailPage = lazy(() =>
  import('@/pages/VideoDetailPage').then((m) => ({ default: m.VideoDetailPage }))
);
const GalleryPage = lazy(() => import('@/pages/GalleryPage').then((m) => ({ default: m.GalleryPage })));
const AlbumDetailPage = lazy(() =>
  import('@/pages/AlbumDetailPage').then((m) => ({ default: m.AlbumDetailPage }))
);
const ContactPage = lazy(() => import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const DesignSystemPage = lazy(() =>
  import('@/pages/DesignSystemPage').then((m) => ({ default: m.DesignSystemPage }))
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Lazy-loaded Admin Authentication & Shell
const AdminLoginPage = lazy(() =>
  import('@/pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);

// Lazy-loaded Admin Modules (Completely isolated inside AdminLayout)
const AdminDashboardOverview = lazy(() =>
  import('@/pages/admin/AdminDashboardOverview').then((m) => ({ default: m.AdminDashboardOverview }))
);
const CmsAdminDashboard = lazy(() =>
  import('@/features/cms').then((m) => ({ default: m.CmsAdminDashboard }))
);
const SettingsManager = lazy(() =>
  import('@/features/cms').then((m) => ({ default: m.SettingsManager }))
);
const PagesManager = lazy(() =>
  import('@/features/cms').then((m) => ({ default: m.PagesManager }))
);
const NavigationManager = lazy(() =>
  import('@/features/cms').then((m) => ({ default: m.NavigationManager }))
);
const HomepageManager = lazy(() =>
  import('@/features/cms').then((m) => ({ default: m.HomepageManager }))
);
const RedirectsManager = lazy(() =>
  import('@/features/cms').then((m) => ({ default: m.RedirectsManager }))
);
const ProfileManager = lazy(() =>
  import('@/features/profile').then((m) => ({ default: m.ProfileManager }))
);
const PracticeAreasManager = lazy(() =>
  import('@/features/practice-areas').then((m) => ({ default: m.PracticeAreasManager }))
);
const CourtroomManager = lazy(() =>
  import('@/features/courtroom').then((m) => ({ default: m.CourtroomManager }))
);
const ResearchManager = lazy(() =>
  import('@/features/research').then((m) => ({ default: m.ResearchManager }))
);
const JudgmentManager = lazy(() =>
  import('@/features/judgments').then((m) => ({ default: m.JudgmentManager }))
);
const PublicationManager = lazy(() =>
  import('@/features/publications').then((m) => ({ default: m.PublicationManager }))
);
const MediaManager = lazy(() =>
  import('@/features/media').then((m) => ({ default: m.MediaManager }))
);
const VideosManager = lazy(() =>
  import('@/features/videos').then((m) => ({ default: m.VideosManager }))
);
const GalleryManager = lazy(() =>
  import('@/features/gallery').then((m) => ({ default: m.GalleryManager }))
);
const ContactInboxManager = lazy(() =>
  import('@/features/contact').then((m) => ({ default: m.ContactInboxManager }))
);

export const router = createBrowserRouter([
  // 1. Admin Authentication Routes
  {
    path: '/admin/login',
    element: withSuspense(AdminLoginPage),
  },
  {
    path: '/login',
    element: withSuspense(AdminLoginPage),
  },

  // 2. Dedicated Enterprise Admin Application Shell (Isolated from Public Layout)
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<AdminPageLoader />}>
            <AdminDashboardOverview />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<AdminPageLoader />}>
            <AdminDashboardOverview />
          </Suspense>
        ),
      },
      {
        path: 'cms',
        element: (
          <Suspense fallback={<AdminPageLoader />}>
            <CmsAdminDashboard />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: withAdminSuspense(SettingsManager),
      },
      {
        path: 'pages',
        element: withAdminSuspense(PagesManager),
      },
      {
        path: 'navigation',
        element: withAdminSuspense(NavigationManager),
      },
      {
        path: 'homepage',
        element: withAdminSuspense(HomepageManager),
      },
      {
        path: 'redirects',
        element: withAdminSuspense(RedirectsManager),
      },
      {
        path: 'profile',
        element: withAdminSuspense(ProfileManager),
      },
      {
        path: 'practice-areas',
        element: withAdminSuspense(PracticeAreasManager),
      },
      {
        path: 'courtroom',
        element: withAdminSuspense(CourtroomManager),
      },
      {
        path: 'research',
        element: withAdminSuspense(ResearchManager),
      },
      {
        path: 'judgments',
        element: withAdminSuspense(JudgmentManager),
      },
      {
        path: 'publications',
        element: withAdminSuspense(PublicationManager),
      },
      {
        path: 'media',
        element: withAdminSuspense(MediaManager),
      },
      {
        path: 'videos',
        element: withAdminSuspense(VideosManager),
      },
      {
        path: 'gallery',
        element: withAdminSuspense(GalleryManager),
      },
      {
        path: 'inquiries',
        element: withAdminSuspense(ContactInboxManager),
      },
    ],
  },

  // 3. Public Website Layout (Contains Public Header, Footer, and Consultation Modal)
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'design-system',
        element: withSuspense(DesignSystemPage),
      },
      {
        path: 'about',
        element: withSuspense(AboutPage),
      },
      {
        path: 'practice-areas',
        element: withSuspense(PracticeAreasPage),
      },
      {
        path: 'practice-areas/:slug',
        element: withSuspense(PracticeAreaDetailPage),
      },
      {
        path: 'courtroom',
        element: withSuspense(CourtroomPage),
      },
      {
        path: 'courtroom/:slug',
        element: withSuspense(CourtroomDetailPage),
      },
      {
        path: 'judgments',
        element: withSuspense(JudgmentsPage),
      },
      {
        path: 'judgments/:slug',
        element: withSuspense(JudgmentDetailPage),
      },
      {
        path: 'research',
        element: withSuspense(ResearchPage),
      },
      {
        path: 'research/:slug',
        element: withSuspense(ResearchDetailPage),
      },
      {
        path: 'publications',
        element: withSuspense(PublicationsPage),
      },
      {
        path: 'publications/:slug',
        element: withSuspense(PublicationDetailPage),
      },
      {
        path: 'media',
        element: withSuspense(MediaPage),
      },
      {
        path: 'media/:slug',
        element: withSuspense(MediaDetailPage),
      },
      {
        path: 'media/press/:slug',
        element: withSuspense(MediaDetailPage),
      },
      {
        path: 'media/appearances/:slug',
        element: withSuspense(MediaDetailPage),
      },
      {
        path: 'videos',
        element: withSuspense(VideosPage),
      },
      {
        path: 'videos/:slug',
        element: withSuspense(VideoDetailPage),
      },
      {
        path: 'gallery',
        element: withSuspense(GalleryPage),
      },
      {
        path: 'gallery/:slug',
        element: withSuspense(AlbumDetailPage),
      },
      {
        path: 'contact',
        element: withSuspense(ContactPage),
      },
      {
        path: '*',
        element: withSuspense(NotFoundPage),
      },
    ],
  },
]);
