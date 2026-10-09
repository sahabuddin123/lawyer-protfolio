import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Container } from '@/components/ui/Container';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';

// Route Fallback during lazy loading
const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-background-primary py-24">
    <LoadingSpinner size="lg" label="Loading Judicial Content..." />
  </div>
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
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

// Lazy-loaded Admin Modules (Completely isolated from public visitors)
const CmsAdminDashboard = lazy(() =>
  import('@/features/cms').then((m) => ({ default: m.CmsAdminDashboard }))
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

export const router = createBrowserRouter([
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
        path: 'admin/cms',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <CmsAdminDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/profile',
        element: (
          <ProtectedRoute>
            <div className="min-h-screen bg-black text-neutral-100 py-8">
              <Container size="wide">
                <Suspense fallback={<PageLoader />}>
                  <ProfileManager />
                </Suspense>
              </Container>
            </div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/practice-areas',
        element: (
          <ProtectedRoute>
            <div className="min-h-screen bg-black text-neutral-100 py-8">
              <Container size="wide">
                <Suspense fallback={<PageLoader />}>
                  <PracticeAreasManager />
                </Suspense>
              </Container>
            </div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/courtroom',
        element: (
          <ProtectedRoute>
            <div className="min-h-screen bg-black text-neutral-100 py-8">
              <Container size="wide">
                <Suspense fallback={<PageLoader />}>
                  <CourtroomManager />
                </Suspense>
              </Container>
            </div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/research',
        element: (
          <ProtectedRoute>
            <div className="min-h-screen bg-black text-neutral-100 py-8">
              <Container size="wide">
                <Suspense fallback={<PageLoader />}>
                  <ResearchManager />
                </Suspense>
              </Container>
            </div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/judgments',
        element: (
          <ProtectedRoute>
            <div className="min-h-screen bg-black text-neutral-100 py-8">
              <Container size="wide">
                <Suspense fallback={<PageLoader />}>
                  <JudgmentManager />
                </Suspense>
              </Container>
            </div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/publications',
        element: (
          <ProtectedRoute>
            <div className="min-h-screen bg-black text-neutral-100 py-8">
              <Container size="wide">
                <Suspense fallback={<PageLoader />}>
                  <PublicationManager />
                </Suspense>
              </Container>
            </div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/media',
        element: (
          <ProtectedRoute>
            <div className="min-h-screen bg-black text-neutral-100 py-8">
              <Container size="wide">
                <Suspense fallback={<PageLoader />}>
                  <MediaManager />
                </Suspense>
              </Container>
            </div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/videos',
        element: (
          <ProtectedRoute>
            <div className="min-h-screen bg-black text-neutral-100 py-8">
              <Container size="wide">
                <Suspense fallback={<PageLoader />}>
                  <VideosManager />
                </Suspense>
              </Container>
            </div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/gallery',
        element: (
          <ProtectedRoute>
            <div className="min-h-screen bg-black text-neutral-100 py-8">
              <Container size="wide">
                <Suspense fallback={<PageLoader />}>
                  <GalleryManager />
                </Suspense>
              </Container>
            </div>
          </ProtectedRoute>
        ),
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
