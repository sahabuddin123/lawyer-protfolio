import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { profileApi } from '@/api/profile';
import {
  AdminPageHeader,
  AdminLoadingState,
} from '@/components/admin';
import {
  ProfileData,
  CredentialItem,
  EducationItem,
  CareerTimelineItem,
  ProfessionalMembershipItem,
} from '@/types/profile';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  BookOpen,
  Award,
  GraduationCap,
  Briefcase,
  Users,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle,
  AlertCircle,
  LayoutGrid,
  ShieldCheck,
  Compass,
  Building2,
  Layers,
} from 'lucide-react';

type ProfileTabType = 'basic' | 'bio' | 'about_page' | 'credentials' | 'educations' | 'timeline' | 'memberships' | 'seo';

const resolveProfileTab = (tab: string | null): ProfileTabType => {
  if (!tab) return 'basic';
  if (tab === 'about' || tab === 'about_page' || tab === 'content') return 'about_page';
  if (tab === 'team' || tab === 'clients') return 'memberships';
  const validTabs: ProfileTabType[] = ['basic', 'bio', 'about_page', 'credentials', 'educations', 'timeline', 'memberships', 'seo'];
  return validTabs.includes(tab as ProfileTabType) ? (tab as ProfileTabType) : 'basic';
};

export const ProfileManager: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<ProfileTabType>(() => resolveProfileTab(tabParam));

  useEffect(() => {
    if (tabParam) {
      setActiveTab(resolveProfileTab(tabParam));
    }
  }, [tabParam]);

  const handleTabChange = (tabId: ProfileTabType) => {
    setActiveTab(tabId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tabId === 'basic') {
        next.delete('tab');
      } else {
        next.set('tab', tabId);
      }
      return next;
    });
  };

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [educations, setEducations] = useState<EducationItem[]>([]);
  const [timeline, setTimeline] = useState<CareerTimelineItem[]>([]);
  const [memberships, setMemberships] = useState<ProfessionalMembershipItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals for CRUD
  const [credModal, setCredModal] = useState<{ open: boolean; item: Partial<CredentialItem> | null }>({
    open: false,
    item: null,
  });
  const [eduModal, setEduModal] = useState<{ open: boolean; item: Partial<EducationItem> | null }>({
    open: false,
    item: null,
  });
  const [timelineModal, setTimelineModal] = useState<{
    open: boolean;
    item: Partial<CareerTimelineItem> | null;
  }>({
    open: false,
    item: null,
  });
  const [membershipModal, setMembershipModal] = useState<{
    open: boolean;
    item: Partial<ProfessionalMembershipItem> | null;
  }>({
    open: false,
    item: null,
  });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [profRes, credRes, eduRes, timeRes, memRes] = await Promise.all([
        profileApi.getAdminProfile(),
        profileApi.getAdminCredentials(),
        profileApi.getAdminEducations(),
        profileApi.getAdminTimeline(),
        profileApi.getAdminMemberships(),
      ]);

      if (profRes.success) setProfile(profRes.data);
      if (credRes.success) setCredentials(credRes.data);
      if (eduRes.success) setEducations(eduRes.data);
      if (timeRes.success) setTimeline(timeRes.data);
      if (memRes.success) setMemberships(memRes.data);
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to load profile data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);
      const res = await profileApi.updateAdminProfile(profile);
      if (res.success) {
        setProfile(res.data);
        showNotification('success', 'Profile updated successfully and cache purged.');
      }
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  // About Page Dynamic Settings Helpers
  const updateAboutHero = (key: string, value: any) => {
    if (!profile) return;
    const currentSettings = profile.about_settings || {};
    const hero = currentSettings.about_hero || {};
    setProfile({
      ...profile,
      about_settings: {
        ...currentSettings,
        about_hero: {
          ...hero,
          [key]: value,
        },
      },
    });
  };

  const updateSectionHeader = (
    section: string,
    field: 'eyebrow' | 'title' | 'description',
    lang: 'en' | 'bn',
    value: string
  ) => {
    if (!profile) return;
    const currentSettings = profile.about_settings || {};
    const headers = currentSettings.about_section_headers || {};
    const currentSection = headers[section] || {};
    const currentField = (currentSection[field] as any) || { en: '', bn: '' };
    setProfile({
      ...profile,
      about_settings: {
        ...currentSettings,
        about_section_headers: {
          ...headers,
          [section]: {
            ...currentSection,
            [field]: {
              ...currentField,
              [lang]: value,
            },
          },
        },
      },
    });
  };

  const updateHighlight = (
    index: number,
    field: 'title' | 'description',
    lang: 'en' | 'bn',
    value: string
  ) => {
    if (!profile) return;
    const currentSettings = profile.about_settings || {};
    const list = [...(currentSettings.about_highlights || [])];
    if (!list[index]) return;
    list[index] = {
      ...list[index],
      [field]: {
        ...(list[index][field] || { en: '', bn: '' }),
        [lang]: value,
      },
    };
    setProfile({
      ...profile,
      about_settings: {
        ...currentSettings,
        about_highlights: list,
      },
    });
  };

  const updateCommitment = (
    index: number,
    field: 'pillar' | 'title' | 'description',
    lang: 'en' | 'bn',
    value: string
  ) => {
    if (!profile) return;
    const currentSettings = profile.about_settings || {};
    const list = [...(currentSettings.about_commitments || [])];
    if (!list[index]) return;
    list[index] = {
      ...list[index],
      [field]: {
        ...(list[index][field] || { en: '', bn: '' }),
        [lang]: value,
      },
    };
    setProfile({
      ...profile,
      about_settings: {
        ...currentSettings,
        about_commitments: list,
      },
    });
  };

  const updateCommitmentIcon = (index: number, icon: string) => {
    if (!profile) return;
    const currentSettings = profile.about_settings || {};
    const list = [...(currentSettings.about_commitments || [])];
    if (!list[index]) return;
    list[index] = {
      ...list[index],
      icon,
    };
    setProfile({
      ...profile,
      about_settings: {
        ...currentSettings,
        about_commitments: list,
      },
    });
  };

  const updateTrainingItem = (
    index: number,
    field: 'title' | 'institution' | 'description' | 'duration',
    lang: 'en' | 'bn',
    value: string
  ) => {
    if (!profile) return;
    const currentSettings = profile.about_settings || {};
    const list = [...(currentSettings.about_trainings || [])];
    if (!list[index]) return;
    list[index] = {
      ...list[index],
      [field]: {
        ...((list[index][field] as any) || { en: '', bn: '' }),
        [lang]: value,
      },
    };
    setProfile({
      ...profile,
      about_settings: {
        ...currentSettings,
        about_trainings: list,
      },
    });
  };

  const updateTrainingYear = (index: number, year: string) => {
    if (!profile) return;
    const currentSettings = profile.about_settings || {};
    const list = [...(currentSettings.about_trainings || [])];
    if (!list[index]) return;
    list[index] = {
      ...list[index],
      year,
    };
    setProfile({
      ...profile,
      about_settings: {
        ...currentSettings,
        about_trainings: list,
      },
    });
  };

  const addTrainingItem = () => {
    if (!profile) return;
    const currentSettings = profile.about_settings || {};
    const list = [...(currentSettings.about_trainings || [])];
    list.push({
      id: `tr-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      duration: { en: '1 Day', bn: '১ দিন' },
      title: { en: '', bn: '' },
      institution: { en: '', bn: '' },
      description: { en: '', bn: '' },
    });
    setProfile({
      ...profile,
      about_settings: {
        ...currentSettings,
        about_trainings: list,
      },
    });
  };

  const removeTrainingItem = (index: number) => {
    if (!profile) return;
    const currentSettings = profile.about_settings || {};
    const list = (currentSettings.about_trainings || []).filter((_, i) => i !== index);
    setProfile({
      ...profile,
      about_settings: {
        ...currentSettings,
        about_trainings: list,
      },
    });
  };

  const updateAboutCta = (field: string, value: any) => {
    if (!profile) return;
    const currentSettings = profile.about_settings || {};
    const cta = currentSettings.about_cta || {};
    setProfile({
      ...profile,
      about_settings: {
        ...currentSettings,
        about_cta: {
          ...cta,
          [field]: value,
        },
      },
    });
  };

  // Credential Actions
  const handleSaveCredential = async (item: Partial<CredentialItem>) => {
    try {
      if (item.id) {
        await profileApi.updateAdminCredential(item.id, item);
        showNotification('success', 'Credential updated successfully.');
      } else {
        await profileApi.createAdminCredential(item);
        showNotification('success', 'Credential created successfully.');
      }
      setCredModal({ open: false, item: null });
      const res = await profileApi.getAdminCredentials();
      if (res.success) setCredentials(res.data);
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Operation failed.');
    }
  };

  const handleDeleteCredential = async (id: number) => {
    if (!window.confirm('Delete this credential?')) return;
    try {
      await profileApi.deleteAdminCredential(id);
      showNotification('success', 'Credential deleted.');
      setCredentials((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  // Education Actions
  const handleSaveEducation = async (item: Partial<EducationItem>) => {
    try {
      if (item.id) {
        await profileApi.updateAdminEducation(item.id, item);
        showNotification('success', 'Education record updated.');
      } else {
        await profileApi.createAdminEducation(item);
        showNotification('success', 'Education record created.');
      }
      setEduModal({ open: false, item: null });
      const res = await profileApi.getAdminEducations();
      if (res.success) setEducations(res.data);
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Operation failed.');
    }
  };

  const handleDeleteEducation = async (id: number) => {
    if (!window.confirm('Delete this education record?')) return;
    try {
      await profileApi.deleteAdminEducation(id);
      showNotification('success', 'Education record deleted.');
      setEducations((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  // Timeline Actions
  const handleSaveTimeline = async (item: Partial<CareerTimelineItem>) => {
    try {
      if (item.id) {
        await profileApi.updateAdminTimeline(item.id, item);
        showNotification('success', 'Timeline milestone updated.');
      } else {
        await profileApi.createAdminTimeline(item);
        showNotification('success', 'Timeline milestone created.');
      }
      setTimelineModal({ open: false, item: null });
      const res = await profileApi.getAdminTimeline();
      if (res.success) setTimeline(res.data);
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Operation failed.');
    }
  };

  const handleDeleteTimeline = async (id: number) => {
    if (!window.confirm('Delete this milestone?')) return;
    try {
      await profileApi.deleteAdminTimeline(id);
      showNotification('success', 'Milestone deleted.');
      setTimeline((prev) => prev.filter((t) => t.id !== id));
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  // Membership Actions
  const handleSaveMembership = async (item: Partial<ProfessionalMembershipItem>) => {
    try {
      if (item.id) {
        await profileApi.updateAdminMembership(item.id, item);
        showNotification('success', 'Membership updated.');
      } else {
        await profileApi.createAdminMembership(item);
        showNotification('success', 'Membership created.');
      }
      setMembershipModal({ open: false, item: null });
      const res = await profileApi.getAdminMemberships();
      if (res.success) setMemberships(res.data);
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Operation failed.');
    }
  };

  const handleDeleteMembership = async (id: number) => {
    if (!window.confirm('Delete this membership?')) return;
    try {
      await profileApi.deleteAdminMembership(id);
      showNotification('success', 'Membership deleted.');
      setMemberships((prev) => prev.filter((m) => m.id !== id));
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  if (loading) {
    return <AdminLoadingState message="Loading advocate & chamber profile..." />;
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-red-500 bg-white rounded-xl border border-red-200">
        Profile data is not available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Advocate & Chamber Profile"
        description="Official credentials, educational tenure, Supreme Court bar enrollment, and professional biographies."
        breadcrumbs={[
          { label: 'Overview', href: '/admin/dashboard' },
          { label: 'Chamber Profile' },
        ]}
      />

      {/* Top Notification */}
      {feedback && (
        <div
          className={`flex items-center rounded-xl p-4 text-sm font-medium border shadow-xs ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Profile Module Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {[
          { id: 'basic', label: 'Basic Info', icon: User },
          { id: 'bio', label: 'Biography', icon: BookOpen },
          { id: 'about_page', label: 'About Page Content', icon: LayoutGrid },
          { id: 'credentials', label: `Credentials (${credentials.length})`, icon: Award },
          { id: 'educations', label: `Education (${educations.length})`, icon: GraduationCap },
          { id: 'timeline', label: `Timeline (${timeline.length})`, icon: Briefcase },
          { id: 'memberships', label: `Memberships (${memberships.length})`, icon: Users },
          { id: 'seo', label: 'SEO Metadata', icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id as ProfileTabType)}
              className={`flex items-center rounded-lg px-3.5 py-2 text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-amber-600 font-semibold text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              <Icon className="mr-1.5 h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. Basic Information Tab */}
      {activeTab === 'basic' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Name (English)
              </label>
              <input
                type="text"
                value={profile.name?.en || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    name: { ...profile.name, en: e.target.value },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Name (Bangla)
              </label>
              <input
                type="text"
                value={profile.name?.bn || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    name: { ...profile.name, bn: e.target.value },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Headline / Title (English)
              </label>
              <input
                type="text"
                value={profile.title?.en || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    title: { ...profile.title, en: e.target.value },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Headline / Title (Bangla)
              </label>
              <input
                type="text"
                value={profile.title?.bn || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    title: { ...profile.title, bn: e.target.value },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Subtitle (English)
              </label>
              <input
                type="text"
                value={profile.subtitle?.en || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    subtitle: {
                      en: e.target.value,
                      bn: profile.subtitle?.bn || '',
                    },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Subtitle (Bangla)
              </label>
              <input
                type="text"
                value={profile.subtitle?.bn || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    subtitle: {
                      en: profile.subtitle?.en || '',
                      bn: e.target.value,
                    },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Bar Council Certification Status
              </label>
              <input
                type="text"
                value={profile.bar_council_enrollment || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bar_council_enrollment: e.target.value,
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Visibility / Status
              </label>
              <select
                value={profile.status}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    status: e.target.value as 'draft' | 'published' | 'hidden',
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              >
                <option value="published">Published (Publicly Visible)</option>
                <option value="draft">Draft (Restricted to Admins)</option>
                <option value="hidden">Hidden (Archived)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Primary Phone
              </label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Primary Email
              </label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Chambers Address (English)
              </label>
              <input
                type="text"
                value={profile.chambers_address?.en || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    chambers_address: { ...profile.chambers_address, en: e.target.value },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Basic Info'}
            </Button>
          </div>
        </form>
      )}

      {/* 2. Biography Tab */}
      {activeTab === 'bio' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Short Biography (English)
              </label>
              <textarea
                rows={4}
                value={profile.short_bio?.en || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    short_bio: { ...profile.short_bio, en: e.target.value },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Short Biography (Bangla)
              </label>
              <textarea
                rows={4}
                value={profile.short_bio?.bn || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    short_bio: { ...profile.short_bio, bn: e.target.value },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Full Legal Biography (HTML — English)
              </label>
              <textarea
                rows={8}
                value={profile.long_bio?.en || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    long_bio: { ...profile.long_bio, en: e.target.value },
                  })
                }
                className="mt-1 w-full font-mono text-xs rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-white focus:border-legal-gold-500 focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Full Legal Biography (HTML — Bangla)
              </label>
              <textarea
                rows={8}
                value={profile.long_bio?.bn || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    long_bio: { ...profile.long_bio, bn: e.target.value },
                  })
                }
                className="mt-1 w-full font-mono text-xs rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Judicial Philosophy (English)
              </label>
              <textarea
                rows={3}
                value={profile.philosophy?.en || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    philosophy: {
                      en: e.target.value,
                      bn: profile.philosophy?.bn || '',
                    },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Judicial Philosophy (Bangla)
              </label>
              <textarea
                rows={3}
                value={profile.philosophy?.bn || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    philosophy: {
                      en: profile.philosophy?.en || '',
                      bn: e.target.value,
                    },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Principled Advocacy / Legal Approach (English)
              </label>
              <textarea
                rows={3}
                value={profile.legal_approach?.en || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    legal_approach: {
                      en: e.target.value,
                      bn: profile.legal_approach?.bn || '',
                    },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Principled Advocacy / Legal Approach (Bangla)
              </label>
              <textarea
                rows={3}
                value={profile.legal_approach?.bn || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    legal_approach: {
                      en: profile.legal_approach?.en || '',
                      bn: e.target.value,
                    },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Biography'}
            </Button>
          </div>
        </form>
      )}

      {/* 2.5 About Page Full Dynamic Content Tab */}
      {activeTab === 'about_page' && (
        <form onSubmit={handleSaveProfile} className="space-y-8">
          <div className="rounded-xl border border-legal-gold-500/30 bg-legal-slate-900/60 p-4 text-xs text-legal-slate-300">
            <div className="flex items-center text-legal-gold-400 font-semibold mb-1">
              <LayoutGrid className="mr-1.5 h-4 w-4" />
              Complete About Page CMS Controls
            </div>
            Manage all public About Page content dynamically from this panel: Hero headlines, badges, section titles & descriptions, professional highlights, the 4 commitment pillars, training workshops, and regulatory disclaimers. Both English and Bengali fields are supported.
          </div>

          {/* SECTION A: Hero & Header Configuration */}
          <div className="rounded-xl border border-legal-slate-800 bg-legal-slate-950/60 p-6 space-y-5">
            <div className="flex items-center space-x-2 border-b border-legal-slate-800 pb-3">
              <ShieldCheck className="h-5 w-5 text-legal-gold-400" />
              <h3 className="font-serif text-lg font-bold text-white">1. Hero Section & Header Badges</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Degree Eyebrow Badge (English)
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_hero?.eyebrow_badge?.en || ''}
                  placeholder="LL.B. (Hons) & LL.M. (First Class)"
                  onChange={(e) =>
                    updateAboutHero('eyebrow_badge', {
                      ...(profile.about_settings?.about_hero?.eyebrow_badge || {}),
                      en: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Degree Eyebrow Badge (Bangla)
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_hero?.eyebrow_badge?.bn || ''}
                  placeholder="এলএল.বি. (অনার্স) ও এলএল.এম. (প্রথম শ্রেণি)"
                  onChange={(e) =>
                    updateAboutHero('eyebrow_badge', {
                      ...(profile.about_settings?.about_hero?.eyebrow_badge || {}),
                      bn: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Hero Stated Objective / Headline (English)
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_hero?.heading?.en || ''}
                  placeholder="Committed to Principled Legal Practice and Access to Justice"
                  onChange={(e) =>
                    updateAboutHero('heading', {
                      ...(profile.about_settings?.about_hero?.heading || {}),
                      en: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Hero Stated Objective / Headline (Bangla)
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_hero?.heading?.bn || ''}
                  placeholder="আইন ও ন্যায়ের শাসন প্রতিষ্ঠায় নীতিবান ও দায়বদ্ধ আইনি সেবা"
                  onChange={(e) =>
                    updateAboutHero('heading', {
                      ...(profile.about_settings?.about_hero?.heading || {}),
                      bn: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Primary Action Button Label (English)
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_hero?.primary_cta_text?.en || ''}
                  placeholder="Request a Consultation"
                  onChange={(e) =>
                    updateAboutHero('primary_cta_text', {
                      ...(profile.about_settings?.about_hero?.primary_cta_text || {}),
                      en: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Primary Action Button Label (Bangla)
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_hero?.primary_cta_text?.bn || ''}
                  placeholder="পরামর্শের জন্য যোগাযোগ"
                  onChange={(e) =>
                    updateAboutHero('primary_cta_text', {
                      ...(profile.about_settings?.about_hero?.primary_cta_text || {}),
                      bn: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Primary Button Target URL
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_hero?.primary_cta_url || '/contact'}
                  onChange={(e) => updateAboutHero('primary_cta_url', e.target.value)}
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Portrait Badge Text (English)
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_hero?.portrait_badge_text?.en || ''}
                  placeholder="Certified Practitioner — Bangladesh Bar Council (2016)"
                  onChange={(e) =>
                    updateAboutHero('portrait_badge_text', {
                      ...(profile.about_settings?.about_hero?.portrait_badge_text || {}),
                      en: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Portrait Badge Text (Bangla)
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_hero?.portrait_badge_text?.bn || ''}
                  placeholder="বাংলাদেশ বার কাউন্সিল প্রত্যয়িত আইনজীবী (২০১৬)"
                  onChange={(e) =>
                    updateAboutHero('portrait_badge_text', {
                      ...(profile.about_settings?.about_hero?.portrait_badge_text || {}),
                      bn: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION B: Section Headings & Descriptions */}
          <div className="rounded-xl border border-legal-slate-800 bg-legal-slate-950/60 p-6 space-y-6">
            <div className="flex items-center space-x-2 border-b border-legal-slate-800 pb-3">
              <Layers className="h-5 w-5 text-legal-gold-400" />
              <h3 className="font-serif text-lg font-bold text-white">2. Section Headings & Narrative Descriptions</h3>
            </div>

            <div className="space-y-6">
              {[
                {
                  id: 'bio',
                  label: 'Section 2: Professional Profile & Bio',
                  hasDesc: false,
                  defaultEyebrow: { en: 'Professional Profile', bn: 'পেশাগত পরিচিতি' },
                  defaultTitle: { en: 'Academic Pedigree, Advocacy Experience & Ethical Practice', bn: 'আইনি সাধনা, পেশাগত অভিজ্ঞতা ও নীতিবান কর্মপদ্ধতি' },
                },
                {
                  id: 'timeline',
                  label: 'Section 3: Career Milestones & Timeline',
                  hasDesc: true,
                  defaultEyebrow: { en: 'Career Milestones', bn: 'পেশাগত সময়রেখা' },
                  defaultTitle: { en: 'Career Journey & Professional Milestones', bn: 'আইন অঙ্গনে পদচিহ্ন ও পেশাগত পথচলা' },
                },
                {
                  id: 'practice_areas',
                  label: 'Section 4: Practice Areas Overview',
                  hasDesc: true,
                  defaultEyebrow: { en: 'Areas of Legal Practice', bn: 'আইনি অনুশীলনের ক্ষেত্রসমূহ' },
                  defaultTitle: { en: 'Categorized Legal Practice Disciplines', bn: 'সিভিতে বর্ণিত অভিজ্ঞতার বিষয়ভিত্তিক আইনি ক্ষেত্র' },
                },
                {
                  id: 'education',
                  label: 'Section 5: Education & Academic Qualifications',
                  hasDesc: true,
                  defaultEyebrow: { en: 'Academic Pedigree & Qualifications', bn: 'আইন শিক্ষাগত যোগ্যতা' },
                  defaultTitle: { en: 'Formal Legal Degrees & Academic Standing', bn: 'প্রাতিষ্ঠানিক আইন ডিগ্রি ও ফলাফল' },
                },
                {
                  id: 'trainings',
                  label: 'Section 6: Professional Development & Training',
                  hasDesc: true,
                  defaultEyebrow: { en: 'Professional Development & Training', bn: 'পেশাগত উন্নয়ন ও প্রশিক্ষণ' },
                  defaultTitle: { en: 'Workshops, Moot Court & Specialized Inquiries', bn: 'আইনি কর্মশালা, মুট কোর্ট এবং মাঠপর্যায়ের গবেষণা' },
                },
                {
                  id: 'commitments',
                  label: 'Section 7: Professional Commitments (The 4 Pillars)',
                  hasDesc: true,
                  defaultEyebrow: { en: 'Professional Commitment', bn: 'আইনি অনুশীলনের চার স্তম্ভ' },
                  defaultTitle: { en: 'Accessibility, Availability, Confidentiality & Integrity', bn: 'সহজলভ্যতা, সময়ানুবর্তিতা, গোপনীয়তা ও সততা' },
                },
                {
                  id: 'memberships',
                  label: 'Section 8: Professional Bar Memberships',
                  hasDesc: false,
                  defaultEyebrow: { en: 'Bar & Chamber Affiliations', bn: 'বার ও চেম্বার অন্তর্ভুক্তি' },
                  defaultTitle: { en: 'Professional Bar Memberships', bn: 'পেশাগত বার অ্যাসোসিয়েশন সদস্যপদ' },
                },
                {
                  id: 'consultation_cta',
                  label: 'Section 9: Chamber Consultation & Locations',
                  hasDesc: true,
                  defaultEyebrow: { en: 'Chamber Consultation', bn: 'চেম্বার ও কার্যালয়' },
                  defaultTitle: { en: 'Discuss Your Legal Matter', bn: 'আপনার আইনি বিষয়ে পরামর্শ গ্রহণ করুন' },
                },
              ].map((sec) => {
                const headerData = profile.about_settings?.about_section_headers?.[sec.id] || {};
                return (
                  <div key={sec.id} className="rounded-lg border border-legal-slate-800 bg-legal-slate-900/50 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-legal-gold-400 uppercase tracking-wide">{sec.label}</h4>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Eyebrow (English)</label>
                        <input
                          type="text"
                          value={headerData.eyebrow?.en || ''}
                          placeholder={sec.defaultEyebrow.en}
                          onChange={(e) => updateSectionHeader(sec.id, 'eyebrow', 'en', e.target.value)}
                          className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Eyebrow (Bangla)</label>
                        <input
                          type="text"
                          value={headerData.eyebrow?.bn || ''}
                          placeholder={sec.defaultEyebrow.bn}
                          onChange={(e) => updateSectionHeader(sec.id, 'eyebrow', 'bn', e.target.value)}
                          className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Title (English)</label>
                        <input
                          type="text"
                          value={headerData.title?.en || ''}
                          placeholder={sec.defaultTitle.en}
                          onChange={(e) => updateSectionHeader(sec.id, 'title', 'en', e.target.value)}
                          className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Title (Bangla)</label>
                        <input
                          type="text"
                          value={headerData.title?.bn || ''}
                          placeholder={sec.defaultTitle.bn}
                          onChange={(e) => updateSectionHeader(sec.id, 'title', 'bn', e.target.value)}
                          className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                        />
                      </div>
                      {sec.hasDesc && (
                        <>
                          <div className="md:col-span-1">
                            <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Description / Subtitle (English)</label>
                            <textarea
                              rows={2}
                              value={headerData.description?.en || ''}
                              onChange={(e) => updateSectionHeader(sec.id, 'description', 'en', e.target.value)}
                              className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Description / Subtitle (Bangla)</label>
                            <textarea
                              rows={2}
                              value={headerData.description?.bn || ''}
                              onChange={(e) => updateSectionHeader(sec.id, 'description', 'bn', e.target.value)}
                              className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION C: Professional Highlights (4 Points) */}
          <div className="rounded-xl border border-legal-slate-800 bg-legal-slate-950/60 p-6 space-y-5">
            <div className="flex items-center space-x-2 border-b border-legal-slate-800 pb-3">
              <CheckCircle className="h-5 w-5 text-legal-gold-400" />
              <h3 className="font-serif text-lg font-bold text-white">3. Professional Highlights (4 Core Checklist Distinctions)</h3>
            </div>

            <div className="space-y-4">
              {(profile.about_settings?.about_highlights || [
                { id: 'hl-1', title: { en: 'University of Chittagong:', bn: 'চট্টগ্রাম বিশ্ববিদ্যালয়:' }, description: { en: 'First Class honors in both LL.B. (Honours, 2011) and LL.M. (2012).', bn: 'এলএল.বি. (অনার্স) ও এলএল.এম. উভয় ডিগ্রিতে প্রথম শ্রেণি।' } },
                { id: 'hl-2', title: { en: 'Bar Council Enrollment:', bn: 'বার কাউন্সিল তালিকাভুক্তি:' }, description: { en: 'Statutory qualification and enrollment as an Advocate in 2016.', bn: '২০১৬ সালে সংবিধিবদ্ধ অ্যাডভোকেটশিপ পরীক্ষায় উত্তীর্ণ।' } },
                { id: 'hl-3', title: { en: 'Litigation & Deeds Vetting:', bn: 'আইনি দলিল ও আরজি খসড়া:' }, description: { en: 'Comprehensive plaint drafting, land title vetting, and commercial contracts.', bn: 'দেওয়ানি ও ফৌজদারি মামলা, ভূমির স্বত্ব দলিল যাচাই ও বাণিজ্যিক চুক্তি।' } },
                { id: 'hl-4', title: { en: 'ADR & Access to Justice:', bn: 'আইনি সহায়তা ও এডিআর:' }, description: { en: 'Institutional ADR, community legal awareness, and PIL coordination.', bn: 'ব্লাস্ট-এর মাধ্যমে মধ্যস্থতা, সচেতনতা ও জনস্বার্থ আইনি কার্যক্রম।' } },
              ]).map((hl, idx) => (
                <div key={hl.id || idx} className="rounded-lg border border-legal-slate-800 bg-legal-slate-900/50 p-4 space-y-3">
                  <span className="text-xs font-semibold text-legal-gold-400">Highlight #{idx + 1}</span>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Key / Subject (English)</label>
                      <input
                        type="text"
                        value={hl.title?.en || ''}
                        onChange={(e) => updateHighlight(idx, 'title', 'en', e.target.value)}
                        className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Key / Subject (Bangla)</label>
                      <input
                        type="text"
                        value={hl.title?.bn || ''}
                        onChange={(e) => updateHighlight(idx, 'title', 'bn', e.target.value)}
                        className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Description (English)</label>
                      <textarea
                        rows={2}
                        value={hl.description?.en || ''}
                        onChange={(e) => updateHighlight(idx, 'description', 'en', e.target.value)}
                        className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Description (Bangla)</label>
                      <textarea
                        rows={2}
                        value={hl.description?.bn || ''}
                        onChange={(e) => updateHighlight(idx, 'description', 'bn', e.target.value)}
                        className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION D: The 4 Commitment Pillars */}
          <div className="rounded-xl border border-legal-slate-800 bg-legal-slate-950/60 p-6 space-y-5">
            <div className="flex items-center space-x-2 border-b border-legal-slate-800 pb-3">
              <Compass className="h-5 w-5 text-legal-gold-400" />
              <h3 className="font-serif text-lg font-bold text-white">4. Professional Commitments (The 4 Core Pillars)</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {(profile.about_settings?.about_commitments || [
                { id: 'accessibility', pillar: { en: 'Accessibility', bn: 'সহজলভ্যতা' }, title: { en: 'Clear Communication & Guidance', bn: 'সহজবোধ্য যোগাযোগ ও দিকনির্দেশনা' }, description: { en: 'Straightforward orientation on statutory procedures...', bn: 'জটিল আইনি পরিভাষা পরিহার করে...' }, icon: 'Compass' },
                { id: 'availability', pillar: { en: 'Availability', bn: 'সময়ানুবর্তিতা' }, title: { en: 'Disciplined Preparation & Follow-up', bn: 'সময়োপযোগী প্রস্তুতি ও দায়িত্বশীল তদারকি' }, description: { en: 'Conscientious scheduling and steady case tracking...', bn: 'নিয়মানুবর্তিতা ও সময়োপযোগী আইনি পদক্ষেপ...' }, icon: 'Clock' },
                { id: 'confidentiality', pillar: { en: 'Confidentiality', bn: 'গোপনীয়তা' }, title: { en: 'Safeguarding Sensitive Records', bn: 'পেশাগত বিশ্বস্ততা ও নথিপত্রের নিরাপত্তা' }, description: { en: 'Strict protection of client disclosures...', bn: 'মক্কেলের ব্যক্তিগত তথ্য...' }, icon: 'Lock' },
                { id: 'integrity', pillar: { en: 'Integrity', bn: 'পেশাগত সততা' }, title: { en: 'Principled & Honest Advocacy', bn: 'নীতিবান মূল্যায়ন ও সততা' }, description: { en: 'Fidelity to truth, accurate factual marshalling...', bn: 'আইনি নীতিশাস্ত্রের কঠোর অনুসরণ...' }, icon: 'ShieldCheck' },
              ]).map((com, idx) => (
                <div key={com.id || idx} className="rounded-lg border border-legal-slate-800 bg-legal-slate-900/60 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-legal-slate-800/80 pb-2">
                    <span className="text-xs font-bold text-legal-gold-400">Pillar #{idx + 1}: {com.pillar?.en || com.id}</span>
                    <select
                      value={com.icon || 'Compass'}
                      onChange={(e) => updateCommitmentIcon(idx, e.target.value)}
                      className="rounded border border-legal-slate-700 bg-legal-slate-800 px-2 py-1 text-xs text-white"
                    >
                      <option value="Compass">Compass (দিকদর্শন)</option>
                      <option value="Clock">Clock (সময়ানুবর্তিতা)</option>
                      <option value="Lock">Lock (গোপনীয়তা)</option>
                      <option value="ShieldCheck">Shield (সততা ও সুরক্ষা)</option>
                      <option value="Scale">Scale (ন্যায়বিচার)</option>
                      <option value="Award">Award (স্বীকৃতি)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Pillar Name (English)</label>
                      <input
                        type="text"
                        value={com.pillar?.en || ''}
                        onChange={(e) => updateCommitment(idx, 'pillar', 'en', e.target.value)}
                        className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Pillar Name (Bangla)</label>
                      <input
                        type="text"
                        value={com.pillar?.bn || ''}
                        onChange={(e) => updateCommitment(idx, 'pillar', 'bn', e.target.value)}
                        className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Core Principle Title (English)</label>
                      <input
                        type="text"
                        value={com.title?.en || ''}
                        onChange={(e) => updateCommitment(idx, 'title', 'en', e.target.value)}
                        className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Core Principle Title (Bangla)</label>
                      <input
                        type="text"
                        value={com.title?.bn || ''}
                        onChange={(e) => updateCommitment(idx, 'title', 'bn', e.target.value)}
                        className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Operational Commitment (English)</label>
                      <textarea
                        rows={2}
                        value={com.description?.en || ''}
                        onChange={(e) => updateCommitment(idx, 'description', 'en', e.target.value)}
                        className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Operational Commitment (Bangla)</label>
                      <textarea
                        rows={2}
                        value={com.description?.bn || ''}
                        onChange={(e) => updateCommitment(idx, 'description', 'bn', e.target.value)}
                        className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION E: Professional Development & Training Workshops */}
          <div className="rounded-xl border border-legal-slate-800 bg-legal-slate-950/60 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-legal-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-legal-gold-400" />
                <h3 className="font-serif text-lg font-bold text-white">5. Professional Development & Training Workshops</h3>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={addTrainingItem}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Workshop
              </Button>
            </div>

            <div className="space-y-4">
              {(profile.about_settings?.about_trainings || []).map((tr, idx) => (
                <div key={tr.id || idx} className="rounded-lg border border-legal-slate-800 bg-legal-slate-900/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-legal-gold-400">Workshop #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeTrainingItem(idx)}
                      className="text-red-400 hover:text-red-300 text-xs flex items-center"
                    >
                      <Trash2 className="mr-1 h-3 w-3" /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Year</label>
                      <input
                        type="text"
                        value={tr.year || ''}
                        placeholder="2016"
                        onChange={(e) => updateTrainingYear(idx, e.target.value)}
                        className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Duration (English)</label>
                      <input
                        type="text"
                        value={tr.duration?.en || ''}
                        placeholder="3 Days / Day Long"
                        onChange={(e) => updateTrainingItem(idx, 'duration', 'en', e.target.value)}
                        className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Duration (Bangla)</label>
                      <input
                        type="text"
                        value={tr.duration?.bn || ''}
                        placeholder="৩ দিন / দিনব্যাপী"
                        onChange={(e) => updateTrainingItem(idx, 'duration', 'bn', e.target.value)}
                        className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Workshop Title (English)</label>
                        <input
                          type="text"
                          value={tr.title?.en || ''}
                          onChange={(e) => updateTrainingItem(idx, 'title', 'en', e.target.value)}
                          className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Workshop Title (Bangla)</label>
                        <input
                          type="text"
                          value={tr.title?.bn || ''}
                          onChange={(e) => updateTrainingItem(idx, 'title', 'bn', e.target.value)}
                          className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Institution / Host (English)</label>
                        <input
                          type="text"
                          value={tr.institution?.en || ''}
                          onChange={(e) => updateTrainingItem(idx, 'institution', 'en', e.target.value)}
                          className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Institution / Host (Bangla)</label>
                        <input
                          type="text"
                          value={tr.institution?.bn || ''}
                          onChange={(e) => updateTrainingItem(idx, 'institution', 'bn', e.target.value)}
                          className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Curriculum Summary (English)</label>
                        <textarea
                          rows={2}
                          value={tr.description?.en || ''}
                          onChange={(e) => updateTrainingItem(idx, 'description', 'en', e.target.value)}
                          className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-legal-slate-400 uppercase">Curriculum Summary (Bangla)</label>
                        <textarea
                          rows={2}
                          value={tr.description?.bn || ''}
                          onChange={(e) => updateTrainingItem(idx, 'description', 'bn', e.target.value)}
                          className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-xs text-white focus:border-legal-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION F: Chamber Consultation CTA & Regulatory Notice */}
          <div className="rounded-xl border border-legal-slate-800 bg-legal-slate-950/60 p-6 space-y-5">
            <div className="flex items-center space-x-2 border-b border-legal-slate-800 pb-3">
              <Building2 className="h-5 w-5 text-legal-gold-400" />
              <h3 className="font-serif text-lg font-bold text-white">6. Chamber Consultation CTA & Regulatory Notice</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Supreme Court Chamber Card Title (English)
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_cta?.chamber_label_supreme_court?.en || ''}
                  placeholder="Supreme Court Chambers"
                  onChange={(e) =>
                    updateAboutCta('chamber_label_supreme_court', {
                      ...(profile.about_settings?.about_cta?.chamber_label_supreme_court || {}),
                      en: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Supreme Court Chamber Card Title (Bangla)
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_cta?.chamber_label_supreme_court?.bn || ''}
                  placeholder="সুপ্রিম কোর্ট চেম্বার"
                  onChange={(e) =>
                    updateAboutCta('chamber_label_supreme_court', {
                      ...(profile.about_settings?.about_cta?.chamber_label_supreme_court || {}),
                      bn: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Principal Office Card Title (English)
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_cta?.chamber_label_office?.en || ''}
                  placeholder="Principal Office"
                  onChange={(e) =>
                    updateAboutCta('chamber_label_office', {
                      ...(profile.about_settings?.about_cta?.chamber_label_office || {}),
                      en: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Principal Office Card Title (Bangla)
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_cta?.chamber_label_office?.bn || ''}
                  placeholder="প্রধান কার্যালয়"
                  onChange={(e) =>
                    updateAboutCta('chamber_label_office', {
                      ...(profile.about_settings?.about_cta?.chamber_label_office || {}),
                      bn: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Consultation Button Text (English)
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_cta?.button_label?.en || ''}
                  placeholder="Schedule Consultation"
                  onChange={(e) =>
                    updateAboutCta('button_label', {
                      ...(profile.about_settings?.about_cta?.button_label || {}),
                      en: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Consultation Button Text (Bangla)
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_cta?.button_label?.bn || ''}
                  placeholder="পরামর্শের অনুরোধ জানান"
                  onChange={(e) =>
                    updateAboutCta('button_label', {
                      ...(profile.about_settings?.about_cta?.button_label || {}),
                      bn: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Consultation Button Destination URL
                </label>
                <input
                  type="text"
                  value={profile.about_settings?.about_cta?.button_url || '/contact'}
                  onChange={(e) => updateAboutCta('button_url', e.target.value)}
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Regulatory Notice / Statutory Disclaimer (English)
                </label>
                <textarea
                  rows={3}
                  value={profile.about_settings?.about_cta?.disclaimer?.en || ''}
                  placeholder="Regulatory Notice: Submitting a consultation inquiry through this platform does not create an automatic advocate-client relationship..."
                  onChange={(e) =>
                    updateAboutCta('disclaimer', {
                      ...(profile.about_settings?.about_cta?.disclaimer || {}),
                      en: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                  Regulatory Notice / Statutory Disclaimer (Bangla)
                </label>
                <textarea
                  rows={3}
                  value={profile.about_settings?.about_cta?.disclaimer?.bn || ''}
                  placeholder="আইনি সতর্কবার্তা: এই ওয়েবসাইটের মাধ্যমে প্রাথমিক যোগাযোগের অনুরোধ কোনো আইনজীবী-মক্কেল সম্পর্ক স্থাপন করে না..."
                  onChange={(e) =>
                    updateAboutCta('disclaimer', {
                      ...(profile.about_settings?.about_cta?.disclaimer || {}),
                      bn: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-4 z-10 flex justify-end rounded-xl border border-legal-slate-800 bg-legal-slate-950/90 p-4 shadow-xl backdrop-blur-md">
            <Button type="submit" variant="primary" disabled={saving} size="lg">
              <Save className="mr-2 h-5 w-5" />
              {saving ? 'Saving About Page Content...' : 'Save All About Page Content'}
            </Button>
          </div>
        </form>
      )}

      {/* 3. Credentials Tab */}
      {activeTab === 'credentials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-white">Verified Credentials</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                setCredModal({
                  open: true,
                  item: {
                    category: 'professional',
                    title: { en: '', bn: '' },
                    institution: { en: '', bn: '' },
                    is_featured: true,
                    is_active: true,
                    sort_order: credentials.length + 1,
                  },
                })
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Credential
            </Button>
          </div>

          <div className="overflow-x-auto rounded border border-legal-slate-800">
            <table className="w-full text-left text-sm text-legal-slate-300">
              <thead className="border-b border-legal-slate-800 bg-legal-slate-900 text-xs text-legal-slate-400 uppercase">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Institution</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-legal-slate-800">
                {credentials.map((cred) => (
                  <tr key={cred.id} className="hover:bg-legal-slate-900/40">
                    <td className="p-3 font-mono text-xs">{cred.sort_order}</td>
                    <td className="p-3 font-medium text-white">{cred.title?.en}</td>
                    <td className="p-3 text-xs">{cred.institution?.en}</td>
                    <td className="p-3">
                      <span className="rounded bg-legal-slate-800 px-2 py-0.5 text-xs text-legal-gold-400">
                        {cred.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge variant={cred.is_active ? 'success' : 'neutral'} size="sm">
                        {cred.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setCredModal({ open: true, item: cred })}
                        className="rounded p-1 text-legal-slate-400 hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCredential(cred.id)}
                        className="rounded p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Educations Tab */}
      {activeTab === 'educations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-white">Academic Qualifications</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                setEduModal({
                  open: true,
                  item: {
                    degree: { en: '', bn: '' },
                    institution: { en: '', bn: '' },
                    is_active: true,
                    sort_order: educations.length + 1,
                  },
                })
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Degree
            </Button>
          </div>

          <div className="overflow-x-auto rounded border border-legal-slate-800">
            <table className="w-full text-left text-sm text-legal-slate-300">
              <thead className="border-b border-legal-slate-800 bg-legal-slate-900 text-xs text-legal-slate-400 uppercase">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Degree</th>
                  <th className="p-3">Institution</th>
                  <th className="p-3">Year</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-legal-slate-800">
                {educations.map((edu) => (
                  <tr key={edu.id} className="hover:bg-legal-slate-900/40">
                    <td className="p-3 font-mono text-xs">{edu.sort_order}</td>
                    <td className="p-3 font-medium text-white">{edu.degree?.en}</td>
                    <td className="p-3 text-xs">{edu.institution?.en}</td>
                    <td className="p-3 text-xs">{edu.year_completed || '—'}</td>
                    <td className="p-3">
                      <Badge variant={edu.is_active ? 'success' : 'neutral'} size="sm">
                        {edu.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setEduModal({ open: true, item: edu })}
                        className="rounded p-1 text-legal-slate-400 hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="rounded p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Career Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-white">Career Milestones</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                setTimelineModal({
                  open: true,
                  item: {
                    period: '',
                    title: { en: '', bn: '' },
                    organization: { en: '', bn: '' },
                    is_current: false,
                    is_active: true,
                    sort_order: timeline.length + 1,
                  },
                })
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Milestone
            </Button>
          </div>

          <div className="overflow-x-auto rounded border border-legal-slate-800">
            <table className="w-full text-left text-sm text-legal-slate-300">
              <thead className="border-b border-legal-slate-800 bg-legal-slate-900 text-xs text-legal-slate-400 uppercase">
                <tr>
                  <th className="p-3">Period</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Organization</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-legal-slate-800">
                {timeline.map((item) => (
                  <tr key={item.id} className="hover:bg-legal-slate-900/40">
                    <td className="p-3 font-medium text-legal-gold-400 text-xs">{item.period}</td>
                    <td className="p-3 text-white">{item.title?.en}</td>
                    <td className="p-3 text-xs">{item.organization?.en}</td>
                    <td className="p-3">
                      <Badge variant={item.is_active ? 'success' : 'neutral'} size="sm">
                        {item.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setTimelineModal({ open: true, item })}
                        className="rounded p-1 text-legal-slate-400 hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTimeline(item.id)}
                        className="rounded p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Professional Memberships Tab */}
      {activeTab === 'memberships' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-white">Bar & Professional Memberships</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                setMembershipModal({
                  open: true,
                  item: {
                    organization: { en: '', bn: '' },
                    role: { en: '', bn: '' },
                    is_active: true,
                    sort_order: memberships.length + 1,
                  },
                })
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Membership
            </Button>
          </div>

          <div className="overflow-x-auto rounded border border-legal-slate-800">
            <table className="w-full text-left text-sm text-legal-slate-300">
              <thead className="border-b border-legal-slate-800 bg-legal-slate-900 text-xs text-legal-slate-400 uppercase">
                <tr>
                  <th className="p-3">Organization</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Number</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-legal-slate-800">
                {memberships.map((mem) => (
                  <tr key={mem.id} className="hover:bg-legal-slate-900/40">
                    <td className="p-3 font-medium text-white">{mem.organization?.en}</td>
                    <td className="p-3 text-xs text-legal-gold-400">{mem.role?.en}</td>
                    <td className="p-3 text-xs">{mem.membership_number || '—'}</td>
                    <td className="p-3">
                      <Badge variant={mem.is_active ? 'success' : 'neutral'} size="sm">
                        {mem.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setMembershipModal({ open: true, item: mem })}
                        className="rounded p-1 text-legal-slate-400 hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMembership(mem.id)}
                        className="rounded p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. SEO Metadata Tab */}
      {activeTab === 'seo' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                SEO Meta Title (English)
              </label>
              <input
                type="text"
                value={profile.seo?.seo_title?.en || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    seo: {
                      ...profile.seo,
                      id: profile.seo?.id || 0,
                      seotable_type: 'App\\Models\\Profile',
                      seotable_id: profile.id,
                      robots: profile.seo?.robots || 'index, follow',
                      seo_title: { ...profile.seo?.seo_title, en: e.target.value } as any,
                    },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                SEO Meta Title (Bangla)
              </label>
              <input
                type="text"
                value={profile.seo?.seo_title?.bn || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    seo: {
                      ...profile.seo,
                      id: profile.seo?.id || 0,
                      seotable_type: 'App\\Models\\Profile',
                      seotable_id: profile.id,
                      robots: profile.seo?.robots || 'index, follow',
                      seo_title: { ...profile.seo?.seo_title, bn: e.target.value } as any,
                    },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Meta Description (English)
              </label>
              <textarea
                rows={3}
                value={profile.seo?.meta_description?.en || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    seo: {
                      ...profile.seo,
                      id: profile.seo?.id || 0,
                      seotable_type: 'App\\Models\\Profile',
                      seotable_id: profile.id,
                      robots: profile.seo?.robots || 'index, follow',
                      meta_description: {
                        ...profile.seo?.meta_description,
                        en: e.target.value,
                      } as any,
                    },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Canonical URL
              </label>
              <input
                type="url"
                value={profile.seo?.canonical_url || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    seo: {
                      ...profile.seo,
                      id: profile.seo?.id || 0,
                      seotable_type: 'App\\Models\\Profile',
                      seotable_id: profile.id,
                      robots: profile.seo?.robots || 'index, follow',
                      canonical_url: e.target.value,
                    },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-legal-slate-300 uppercase">
                Robots Directives
              </label>
              <input
                type="text"
                value={profile.seo?.robots || 'index, follow'}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    seo: {
                      ...profile.seo,
                      id: profile.seo?.id || 0,
                      seotable_type: 'App\\Models\\Profile',
                      seotable_id: profile.id,
                      robots: e.target.value,
                    },
                  })
                }
                className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2.5 text-sm text-white focus:border-legal-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save SEO Metadata'}
            </Button>
          </div>
        </form>
      )}

      {/* Credential Modal */}
      {credModal.open && credModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-lg border border-legal-slate-800 bg-legal-midnight p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-white">
              {credModal.item.id ? 'Edit Credential' : 'New Credential'}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-legal-slate-300 uppercase">
                  Category
                </label>
                <select
                  value={credModal.item.category || 'professional'}
                  onChange={(e) =>
                    setCredModal({
                      ...credModal,
                      item: { ...credModal.item, category: e.target.value as any },
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-sm text-white"
                >
                  <option value="court">Court Admission</option>
                  <option value="professional">Professional Body</option>
                  <option value="academic">Academic Pedigree</option>
                  <option value="certification">Certification</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-legal-slate-300 uppercase">
                  Title (EN)
                </label>
                <input
                  type="text"
                  value={credModal.item.title?.en || ''}
                  onChange={(e) =>
                    setCredModal({
                      ...credModal,
                      item: {
                        ...credModal.item,
                        title: { ...credModal.item?.title, en: e.target.value } as any,
                      },
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-legal-slate-300 uppercase">
                  Title (BN)
                </label>
                <input
                  type="text"
                  value={credModal.item.title?.bn || ''}
                  onChange={(e) =>
                    setCredModal({
                      ...credModal,
                      item: {
                        ...credModal.item,
                        title: { ...credModal.item?.title, bn: e.target.value } as any,
                      },
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-legal-slate-300 uppercase">
                  Institution (EN)
                </label>
                <input
                  type="text"
                  value={credModal.item.institution?.en || ''}
                  onChange={(e) =>
                    setCredModal({
                      ...credModal,
                      item: {
                        ...credModal.item,
                        institution: { ...credModal.item?.institution, en: e.target.value } as any,
                      },
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-sm text-white"
                  required
                />
              </div>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 text-xs text-legal-slate-300">
                  <input
                    type="checkbox"
                    checked={credModal.item.is_active ?? true}
                    onChange={(e) =>
                      setCredModal({
                        ...credModal,
                        item: { ...credModal.item, is_active: e.target.checked },
                      })
                    }
                  />
                  <span>Active</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-legal-slate-300">
                  <input
                    type="checkbox"
                    checked={credModal.item.is_featured ?? true}
                    onChange={(e) =>
                      setCredModal({
                        ...credModal,
                        item: { ...credModal.item, is_featured: e.target.checked },
                      })
                    }
                  />
                  <span>Featured</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setCredModal({ open: false, item: null })}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleSaveCredential(credModal.item!)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Education Modal */}
      {eduModal.open && eduModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-lg border border-legal-slate-800 bg-legal-midnight p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-white">
              {eduModal.item.id ? 'Edit Education' : 'New Education Degree'}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-legal-slate-300 uppercase">
                  Degree (EN)
                </label>
                <input
                  type="text"
                  value={eduModal.item.degree?.en || ''}
                  onChange={(e) =>
                    setEduModal({
                      ...eduModal,
                      item: {
                        ...eduModal.item,
                        degree: { ...eduModal.item?.degree, en: e.target.value } as any,
                      },
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-legal-slate-300 uppercase">
                  Institution (EN)
                </label>
                <input
                  type="text"
                  value={eduModal.item.institution?.en || ''}
                  onChange={(e) =>
                    setEduModal({
                      ...eduModal,
                      item: {
                        ...eduModal.item,
                        institution: { ...eduModal.item?.institution, en: e.target.value } as any,
                      },
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-legal-slate-300 uppercase">
                  Year Completed (Optional)
                </label>
                <input
                  type="text"
                  value={eduModal.item.year_completed || ''}
                  onChange={(e) =>
                    setEduModal({
                      ...eduModal,
                      item: { ...eduModal.item, year_completed: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-sm text-white"
                />
              </div>
              <label className="flex items-center space-x-2 text-xs text-legal-slate-300">
                <input
                  type="checkbox"
                  checked={eduModal.item.is_active ?? true}
                  onChange={(e) =>
                    setEduModal({
                      ...eduModal,
                      item: { ...eduModal.item, is_active: e.target.checked },
                    })
                  }
                />
                <span>Active</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEduModal({ open: false, item: null })}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleSaveEducation(eduModal.item!)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {timelineModal.open && timelineModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-lg border border-legal-slate-800 bg-legal-midnight p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-white">
              {timelineModal.item.id ? 'Edit Milestone' : 'New Career Milestone'}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-legal-slate-300 uppercase">
                  Period (e.g. 2019 - Present)
                </label>
                <input
                  type="text"
                  value={timelineModal.item.period || ''}
                  onChange={(e) =>
                    setTimelineModal({
                      ...timelineModal,
                      item: { ...timelineModal.item, period: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-legal-slate-300 uppercase">
                  Title (EN)
                </label>
                <input
                  type="text"
                  value={timelineModal.item.title?.en || ''}
                  onChange={(e) =>
                    setTimelineModal({
                      ...timelineModal,
                      item: {
                        ...timelineModal.item,
                        title: { ...timelineModal.item?.title, en: e.target.value } as any,
                      },
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-legal-slate-300 uppercase">
                  Organization (EN)
                </label>
                <input
                  type="text"
                  value={timelineModal.item.organization?.en || ''}
                  onChange={(e) =>
                    setTimelineModal({
                      ...timelineModal,
                      item: {
                        ...timelineModal.item,
                        organization: {
                          ...timelineModal.item?.organization,
                          en: e.target.value,
                        } as any,
                      },
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-sm text-white"
                  required
                />
              </div>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 text-xs text-legal-slate-300">
                  <input
                    type="checkbox"
                    checked={timelineModal.item.is_current ?? false}
                    onChange={(e) =>
                      setTimelineModal({
                        ...timelineModal,
                        item: { ...timelineModal.item, is_current: e.target.checked },
                      })
                    }
                  />
                  <span>Current Position</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-legal-slate-300">
                  <input
                    type="checkbox"
                    checked={timelineModal.item.is_active ?? true}
                    onChange={(e) =>
                      setTimelineModal({
                        ...timelineModal,
                        item: { ...timelineModal.item, is_active: e.target.checked },
                      })
                    }
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setTimelineModal({ open: false, item: null })}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleSaveTimeline(timelineModal.item!)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Membership Modal */}
      {membershipModal.open && membershipModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-lg border border-legal-slate-800 bg-legal-midnight p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-white">
              {membershipModal.item.id ? 'Edit Membership' : 'New Professional Membership'}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-legal-slate-300 uppercase">
                  Organization (EN)
                </label>
                <input
                  type="text"
                  value={membershipModal.item.organization?.en || ''}
                  onChange={(e) =>
                    setMembershipModal({
                      ...membershipModal,
                      item: {
                        ...membershipModal.item,
                        organization: {
                          ...membershipModal.item?.organization,
                          en: e.target.value,
                        } as any,
                      },
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-legal-slate-300 uppercase">
                  Role (EN)
                </label>
                <input
                  type="text"
                  value={membershipModal.item.role?.en || ''}
                  onChange={(e) =>
                    setMembershipModal({
                      ...membershipModal,
                      item: {
                        ...membershipModal.item,
                        role: { ...membershipModal.item?.role, en: e.target.value } as any,
                      },
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-legal-slate-300 uppercase">
                  Membership No. (Optional)
                </label>
                <input
                  type="text"
                  value={membershipModal.item.membership_number || ''}
                  onChange={(e) =>
                    setMembershipModal({
                      ...membershipModal,
                      item: { ...membershipModal.item, membership_number: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded border border-legal-slate-700 bg-legal-slate-900 p-2 text-sm text-white"
                />
              </div>
              <label className="flex items-center space-x-2 text-xs text-legal-slate-300">
                <input
                  type="checkbox"
                  checked={membershipModal.item.is_active ?? true}
                  onChange={(e) =>
                    setMembershipModal({
                      ...membershipModal,
                      item: { ...membershipModal.item, is_active: e.target.checked },
                    })
                  }
                />
                <span>Active</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setMembershipModal({ open: false, item: null })}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleSaveMembership(membershipModal.item!)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
