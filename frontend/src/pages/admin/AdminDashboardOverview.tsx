import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  Landmark,
  Gavel,
  BookOpen,
  MessageSquareQuote,
  FileText,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { AdminContent, AdminLoadingState } from '@/components/admin';
import { practiceAreaApi } from '@/api/practiceAreas';
import { courtroomApi } from '@/api/courtroom';
import { judgmentsApi } from '@/api/judgments';
import { researchApi } from '@/api/research';
import { contactApi } from '@/api/contact';
import { cmsApi } from '@/api/cms';
import { useAuth } from '@/features/auth/AuthContext';
import { useTranslation } from '@/i18n';
import type { ConsultationRequest } from '@/types/contact';

interface DashboardStats {
  practiceAreas: number;
  courtroomCases: number;
  judgments: number;
  researches: number;
  consultations: number;
  pages: number;
}

export const AdminDashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const { formatDate } = useTranslation();

  const [stats, setStats] = useState<DashboardStats>({
    practiceAreas: 0,
    courtroomCases: 0,
    judgments: 0,
    researches: 0,
    consultations: 0,
    pages: 0,
  });

  const [recentConsultations, setRecentConsultations] = useState<ConsultationRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const [
        paRes,
        courtRes,
        judgeRes,
        resRes,
        consultRes,
        pagesRes,
      ] = await Promise.allSettled([
        practiceAreaApi.getAdminPracticeAreas({ per_page: 1 }),
        courtroomApi.getAdminCourtroomExperiences({ per_page: 1 }),
        judgmentsApi.getAdminJudgments({ per_page: 1 }),
        researchApi.getAdminResearches({ per_page: 1 }),
        contactApi.getAdminConsultations({ per_page: 5 }),
        cmsApi.getAdminPages({ per_page: 1 }),
      ]);

      setStats({
        practiceAreas: paRes.status === 'fulfilled' ? paRes.value.meta?.total ?? paRes.value.data?.length ?? 0 : 0,
        courtroomCases: courtRes.status === 'fulfilled' ? courtRes.value.meta?.total ?? courtRes.value.data?.length ?? 0 : 0,
        judgments: judgeRes.status === 'fulfilled' ? judgeRes.value.meta?.total ?? judgeRes.value.data?.length ?? 0 : 0,
        researches: resRes.status === 'fulfilled' ? resRes.value.meta?.total ?? resRes.value.data?.length ?? 0 : 0,
        consultations: consultRes.status === 'fulfilled' ? consultRes.value.meta?.total ?? consultRes.value.data?.length ?? 0 : 0,
        pages: pagesRes.status === 'fulfilled' ? pagesRes.value.meta?.total ?? pagesRes.value.data?.length ?? 0 : 0,
      });

      if (consultRes.status === 'fulfilled' && consultRes.value.data) {
        setRecentConsultations(consultRes.value.data);
      }
    } catch {
      // Gracefully handle partial API responses
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Practice Areas',
      value: stats.practiceAreas,
      description: 'Active legal domains',
      icon: Scale,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200/70',
      href: '/admin/practice-areas',
    },
    {
      title: 'Courtroom Cases',
      value: stats.courtroomCases,
      description: 'Litigation & trial records',
      icon: Landmark,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200/70',
      href: '/admin/courtroom',
    },
    {
      title: 'Landmark Judgments',
      value: stats.judgments,
      description: 'Reported decisions & rulings',
      icon: Gavel,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200/70',
      href: '/admin/judgments',
    },
    {
      title: 'Legal Research',
      value: stats.researches,
      description: 'Scholarly papers & briefs',
      icon: BookOpen,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200/70',
      href: '/admin/research',
    },
    {
      title: 'Client Inquiries',
      value: stats.consultations,
      description: 'Consultation requests',
      icon: MessageSquareQuote,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200/70',
      href: '/admin/inquiries',
    },
    {
      title: 'Static Pages',
      value: stats.pages,
      description: 'Policy & institutional briefs',
      icon: FileText,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200',
      href: '/admin/pages',
    },
  ];

  const quickActions = [
    {
      title: 'Add Courtroom Case',
      desc: 'Document a trial or appellate case record',
      icon: Landmark,
      href: '/admin/courtroom',
      btnText: '+ New Case',
    },
    {
      title: 'Publish Legal Research',
      desc: 'Publish a new jurisprudence commentary or paper',
      icon: BookOpen,
      href: '/admin/research',
      btnText: '+ New Research',
    },
    {
      title: 'Add Practice Area',
      desc: 'Add or edit legal expertise specialization',
      icon: Scale,
      href: '/admin/practice-areas',
      btnText: '+ Practice Area',
    },
    {
      title: 'Review Client Inquiries',
      desc: 'Inspect pending consultation booking requests',
      icon: MessageSquareQuote,
      href: '/admin/inquiries',
      btnText: 'View Inbox',
    },
  ];

  return (
    <AdminContent wide>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800 mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Supreme Court Chamber Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
              Welcome, {user?.name || 'Advocate Nijam Uddin'}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Official Content Management System & Back-Office for Advocate Nijam Uddin (Haq), Supreme Court of Bangladesh. Real-time synchronized database and publish pipeline.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all flex items-center gap-2 cursor-pointer"
              title="Refresh Real-time Metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span>Sync Metrics</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {isLoading ? (
        <AdminLoadingState message="Auditing judicial records and database statistics..." />
      ) : (
        <div className="space-y-8">
          {/* KPI Metrics Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Database Records Summary</span>
                <span className="text-xs font-normal text-slate-500 font-mono">(Live Data)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {statCards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <Link
                    key={card.title}
                    to={card.href}
                    className={`bg-white rounded-xl p-5 border ${card.borderColor} shadow-xs hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`w-10 h-10 rounded-xl ${card.bgColor} ${card.color} flex items-center justify-center font-bold`}>
                          <IconComponent className="w-5 h-5" />
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <span className="block text-2xl font-bold text-slate-900 tracking-tight">
                        {card.value}
                      </span>
                      <span className="block text-xs font-semibold text-slate-700 mt-0.5">
                        {card.title}
                      </span>
                    </div>
                    <span className="block text-[11px] text-slate-400 mt-2 truncate">
                      {card.description}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Hub */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Quick Content Actions
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <div
                    key={action.title}
                    className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
                        <ActionIcon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {action.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {action.desc}
                      </p>
                    </div>

                    <Link
                      to={action.href}
                      className="mt-4 inline-flex items-center justify-center px-3 py-2 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-xs font-semibold border border-slate-200 hover:border-amber-200 transition-colors"
                    >
                      {action.btnText}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Inquiries & Consultations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Consultation Intake Queue */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Recent Consultation Requests
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct chamber intake requests awaiting legal review
                  </p>
                </div>
                <Link
                  to="/admin/inquiries"
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1"
                >
                  <span>View All Inquiries</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentConsultations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <MessageSquareQuote className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-800">No Pending Requests</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    All client consultation bookings and inquiries have been reviewed.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-medium">
                        <th className="pb-3 font-semibold text-slate-600">Client / Contact</th>
                        <th className="pb-3 font-semibold text-slate-600">Specialization</th>
                        <th className="pb-3 font-semibold text-slate-600">Date</th>
                        <th className="pb-3 font-semibold text-slate-600 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentConsultations.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 pr-3">
                            <span className="block font-semibold text-slate-900">{item.name}</span>
                            <span className="block text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              {item.phone && (
                                <span className="inline-flex items-center gap-0.5">
                                  <Phone className="w-2.5 h-2.5 text-slate-400" />
                                  {item.phone}
                                </span>
                              )}
                              {item.email && (
                                <span className="inline-flex items-center gap-0.5">
                                  <Mail className="w-2.5 h-2.5 text-slate-400" />
                                  {item.email}
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="py-3.5 pr-3">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                              {typeof item.practice_area === 'object' && item.practice_area !== null
                                ? (typeof item.practice_area.title === 'string'
                                    ? item.practice_area.title
                                    : item.practice_area.title?.en || item.practice_area.title?.bn || 'General Consultation')
                                : (typeof item.practice_area === 'string' ? item.practice_area : 'General Consultation')}
                            </span>
                          </td>
                          <td className="py-3.5 pr-3 text-slate-500 text-[11px]">
                            {item.created_at ? formatDate(item.created_at) : 'Recent'}
                          </td>
                          <td className="py-3.5 text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                item.status === 'scheduled' || item.status === 'closed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : item.status === 'spam'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {item.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Platform & Server Health Overview */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100 mb-4 flex items-center justify-between">
                  <span>System Architecture</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>

                <ul className="space-y-3.5 text-xs">
                  <li className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Infrastructure</span>
                    <span className="font-semibold text-slate-800">Ubuntu 24.04 LTS / Hostinger</span>
                  </li>
                  <li className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Web Engine</span>
                    <span className="font-semibold text-slate-800">Nginx + PHP-FPM 8.2</span>
                  </li>
                  <li className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Database</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      MySQL Connected
                    </span>
                  </li>
                  <li className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Backend API</span>
                    <span className="font-mono text-slate-700 text-[11px]">/api/v1 (Laravel 11)</span>
                  </li>
                  <li className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Security Guard</span>
                    <span className="font-semibold text-slate-800">Sanctum RBAC Active</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  to="/admin/settings"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Configure Site Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminContent>
  );
};
