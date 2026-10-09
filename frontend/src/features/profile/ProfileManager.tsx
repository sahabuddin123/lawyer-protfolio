import React, { useEffect, useState } from 'react';
import { profileApi } from '@/api/profile';
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
  RefreshCw,
} from 'lucide-react';

export const ProfileManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'basic' | 'bio' | 'credentials' | 'educations' | 'timeline' | 'memberships' | 'seo'
  >('basic');

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
    return (
      <div className="flex items-center justify-center py-20 text-legal-slate-400">
        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
        Loading Profile Information...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-red-400">
        Profile data is not available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Notification */}
      {feedback && (
        <div
          className={`flex items-center rounded-lg p-4 text-sm font-medium ${
            feedback.type === 'success'
              ? 'border border-emerald-900/60 bg-emerald-950/40 text-emerald-300'
              : 'border border-red-900/60 bg-red-950/40 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="mr-2 h-4 w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="mr-2 h-4 w-4 text-red-400" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Profile Module Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-legal-slate-800 pb-4">
        {[
          { id: 'basic', label: 'Basic Info', icon: User },
          { id: 'bio', label: 'Biography', icon: BookOpen },
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
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center rounded-md px-3.5 py-2 text-xs font-medium transition ${
                isActive
                  ? 'bg-legal-gold-500 font-semibold text-legal-midnight shadow'
                  : 'bg-legal-slate-900 text-legal-slate-300 hover:bg-legal-slate-800'
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
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Biography'}
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
