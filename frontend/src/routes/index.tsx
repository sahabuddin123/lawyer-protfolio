import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { DesignSystemPage } from '@/pages/DesignSystemPage';
import { AboutPage } from '@/pages/AboutPage';
import { PracticeAreasPage } from '@/pages/PracticeAreasPage';
import { PracticeAreaDetailPage } from '@/pages/PracticeAreaDetailPage';
import { CourtroomPage } from '@/pages/CourtroomPage';
import { CourtroomDetailPage } from '@/pages/CourtroomDetailPage';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { CmsAdminDashboard } from '@/features/cms';
import { ProfileManager } from '@/features/profile';
import { PracticeAreasManager } from '@/features/practice-areas';
import { CourtroomManager } from '@/features/courtroom';
import { ResearchManager } from '@/features/research';
import { ResearchPage } from '@/pages/ResearchPage';
import { ResearchDetailPage } from '@/pages/ResearchDetailPage';
import { JudgmentManager } from '@/features/judgments';
import { JudgmentsPage } from '@/pages/JudgmentsPage';
import { JudgmentDetailPage } from '@/pages/JudgmentDetailPage';
import { PublicationManager } from '@/features/publications';
import { PublicationsPage } from '@/pages/PublicationsPage';
import { PublicationDetailPage } from '@/pages/PublicationDetailPage';
import { MediaManager } from '@/features/media';
import { MediaPage } from '@/pages/MediaPage';
import { MediaDetailPage } from '@/pages/MediaDetailPage';
import { Container } from '@/components/ui/Container';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <DesignSystemPage />,
      },
      {
        path: 'design-system',
        element: <DesignSystemPage />,
      },
      {
        path: 'admin/cms',
        element: (
          <ProtectedRoute>
            <CmsAdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/profile',
        element: (
          <ProtectedRoute>
            <div className="min-h-screen bg-black text-neutral-100 py-8">
              <Container size="wide">
                <ProfileManager />
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
                <PracticeAreasManager />
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
                <CourtroomManager />
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
                <ResearchManager />
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
                <JudgmentManager />
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
                <PublicationManager />
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
                <MediaManager />
              </Container>
            </div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'practice-areas',
        element: <PracticeAreasPage />,
      },
      {
        path: 'practice-areas/:slug',
        element: <PracticeAreaDetailPage />,
      },
      {
        path: 'courtroom',
        element: <CourtroomPage />,
      },
      {
        path: 'courtroom/:slug',
        element: <CourtroomDetailPage />,
      },
      {
        path: 'judgments',
        element: <JudgmentsPage />,
      },
      {
        path: 'judgments/:slug',
        element: <JudgmentDetailPage />,
      },
      {
        path: 'research',
        element: <ResearchPage />,
      },
      {
        path: 'research/:slug',
        element: <ResearchDetailPage />,
      },
      {
        path: 'publications',
        element: <PublicationsPage />,
      },
      {
        path: 'publications/:slug',
        element: <PublicationDetailPage />,
      },
      {
        path: 'media',
        element: <MediaPage />,
      },
      {
        path: 'media/:slug',
        element: <MediaDetailPage />,
      },
      {
        path: 'media/press/:slug',
        element: <MediaDetailPage />,
      },
      {
        path: 'media/appearances/:slug',
        element: <MediaDetailPage />,
      },
      {
        path: 'videos',
        element: (
          <PlaceholderPage
            title="Broadcast Archive & Lectures"
            eyebrow="Video Library"
            description="Recorded dialogues, judicial seminars, and television panel discussions."
          />
        ),
      },
      {
        path: 'gallery',
        element: (
          <PlaceholderPage
            title="Chamber Life & Milestones"
            eyebrow="Photographic Documentation"
            description="Visual archive of Supreme Court bar functions, academic convocations, and legal seminars."
          />
        ),
      },
      {
        path: 'contact',
        element: (
          <PlaceholderPage
            title="Chamber Intake & Appointments"
            eyebrow="Advocate Consultation"
            description="Schedule a formal legal conference or transmit litigation briefs to the Supreme Court chambers."
          />
        ),
      },
    ],
  },
]);
