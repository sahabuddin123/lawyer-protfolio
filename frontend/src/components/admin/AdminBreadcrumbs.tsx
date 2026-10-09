import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

// Friendly route titles mapping
const ROUTE_LABELS: Record<string, string> = {
  admin: 'CMS Portal',
  dashboard: 'Executive Overview',
  cms: 'CMS Console',
  settings: 'Site Settings',
  pages: 'Static Pages',
  navigation: 'Navigation Menus',
  homepage: 'Homepage Sections',
  redirects: 'URL Redirects',
  profile: 'Advocate Profile',
  'practice-areas': 'Practice Areas',
  courtroom: 'Courtroom Cases',
  research: 'Legal Research',
  judgments: 'Landmark Judgments',
  publications: 'Publications',
  media: 'Media & Press',
  videos: 'Video Archive',
  gallery: 'Photo Gallery',
  inquiries: 'Inquiries & Consultations',
};

export const AdminBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // If on bare /admin or /admin/dashboard, show single breadcrumb
  if (pathnames.length <= 1) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 font-medium">
        <span className="flex items-center text-slate-700 font-semibold gap-1.5">
          <Home className="w-3.5 h-3.5 text-amber-600" />
          <span>Dashboard Overview</span>
        </span>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
      <Link
        to="/admin/dashboard"
        className="flex items-center text-slate-500 hover:text-slate-800 transition-colors gap-1"
        title="Admin Dashboard"
      >
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline">Portal</span>
      </Link>

      {pathnames.map((value, index) => {
        // Skip root 'admin' prefix in breadcrumb chain for concise display
        if (value === 'admin') return null;

        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = ROUTE_LABELS[value] || value.replace(/-/g, ' ');

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-slate-300 mx-1.5 flex-shrink-0" />
            {isLast ? (
              <span className="text-slate-900 font-semibold capitalize" aria-current="page">
                {label}
              </span>
            ) : (
              <Link
                to={to}
                className="text-slate-500 hover:text-slate-800 transition-colors capitalize"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
