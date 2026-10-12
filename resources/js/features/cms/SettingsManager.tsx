import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { cmsApi } from '@/api/cms';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { useToast } from '@/components/feedback/Toast';
import { AdminPageHeader, AdminLoadingState } from '@/components/admin';
import { Globe, Image, Phone, Share2, Search, Save, AlertCircle, MessageSquareQuote, LayoutGrid, ArrowRight } from 'lucide-react';
import type { SiteSetting } from '@/types';

type TabType = 'general' | 'branding' | 'contact' | 'social' | 'seo' | 'cta' | 'about';

export const SettingsManager: React.FC = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabQuery = searchParams.get('tab') as TabType | null;
  const validTabs: TabType[] = ['general', 'branding', 'contact', 'social', 'seo', 'cta', 'about'];
  const activeTab: TabType = tabQuery && validTabs.includes(tabQuery) ? tabQuery : 'general';

  const setActiveTab = (tab: TabType) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'general') {
        next.delete('tab');
      } else {
        next.set('tab', tab);
      }
      return next;
    });
  };

  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await cmsApi.getAdminSettings();
      const list = Array.isArray(data) ? data : [];
      setSettings(list);

      const map: Record<string, any> = {};
      list.forEach((s) => {
        map[s.key] = s.raw_value ?? s.value;
      });
      setFormData(map);
      setHasChanges(false);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error loading settings',
        message: err.message || 'Failed to retrieve administrative site settings.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleBilingualChange = (key: string, lang: 'en' | 'bn', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...(typeof prev[key] === 'object' && prev[key] !== null ? prev[key] : {}),
        [lang]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = Object.entries(formData).map(([k, val]) => {
        const original = settings.find((s) => s.key === k);
        return {
          key: k,
          value: val,
          group: original?.group || activeTab,
          is_public: original?.is_public ?? true,
        };
      });

      await cmsApi.updateAdminSettings(payload);
      showToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Site configuration updated and caches invalidated successfully.',
      });
      setHasChanges(false);
      fetchSettings();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.response?.data?.message || err.message || 'Could not update settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const tabList = [
    { id: 'general', label: 'General Info', icon: Globe },
    { id: 'branding', label: 'Branding & Assets', icon: Image },
    { id: 'contact', label: 'Chamber & Contact', icon: Phone },
    { id: 'social', label: 'Social Profiles', icon: Share2 },
    { id: 'seo', label: 'SEO & Meta Tags', icon: Search },
    { id: 'cta', label: 'Global Call to Action', icon: MessageSquareQuote },
    { id: 'about', label: 'About Page', icon: LayoutGrid },
  ] as const;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Site Settings & Configuration"
        description="Manage global website metadata, branding assets, chamber contact channels, and search engine parameters."
        actions={
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Unsaved Changes
              </span>
            )}
            <Button
              type="submit"
              form="settings-form"
              variant="primary"
              isLoading={isSaving}
              disabled={!hasChanges || isSaving}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save All Settings</span>
            </Button>
          </div>
        }
      />

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {tabList.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TabIcon
                className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-amber-600' : 'text-slate-400'}`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <AdminLoadingState message="Loading administrative site settings..." />
      ) : (
        <form id="settings-form" onSubmit={handleSave} className="space-y-6">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="p-6 bg-white border border-slate-200/90 rounded-xl shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">General Website Configuration</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Core chamber identity and official judicial credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Website Name (English)"
                  value={formData.site_name?.en || ''}
                  onChange={(e) => handleBilingualChange('site_name', 'en', e.target.value)}
                  placeholder="Advocate Nijam Uddin"
                  required
                />
                <Input
                  label="Website Name (Bangla)"
                  value={formData.site_name?.bn || ''}
                  onChange={(e) => handleBilingualChange('site_name', 'bn', e.target.value)}
                  placeholder="এডভোকেট নিজাম উদ্দিন"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Site Title (English)"
                  value={formData.site_title?.en || ''}
                  onChange={(e) => handleBilingualChange('site_title', 'en', e.target.value)}
                  placeholder="Advocate Nijam Uddin (Haq) — Supreme Court of Bangladesh"
                />
                <Input
                  label="Site Title (Bangla)"
                  value={formData.site_title?.bn || ''}
                  onChange={(e) => handleBilingualChange('site_title', 'bn', e.target.value)}
                  placeholder="এডভোকেট নিজাম উদ্দিন (হক) — বাংলাদেশ সুপ্রিম কোর্ট"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea
                  label="Short Description (English)"
                  value={formData.short_description?.en || ''}
                  onChange={(e) => handleBilingualChange('short_description', 'en', e.target.value)}
                  rows={3}
                />
                <Textarea
                  label="Short Description (Bangla)"
                  value={formData.short_description?.bn || ''}
                  onChange={(e) => handleBilingualChange('short_description', 'bn', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Copyright Notice (English)"
                  value={formData.copyright_text?.en || ''}
                  onChange={(e) => handleBilingualChange('copyright_text', 'en', e.target.value)}
                />
                <Input
                  label="Copyright Notice (Bangla)"
                  value={formData.copyright_text?.bn || ''}
                  onChange={(e) => handleBilingualChange('copyright_text', 'bn', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="p-6 bg-white border border-slate-200/90 rounded-xl shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Branding & Logo Assets</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Media library file references for official judicial headers, footers, and browser favicons.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Primary Logo Media ID or Path"
                  value={formData.primary_logo?.value || ''}
                  onChange={(e) => handleFieldChange('primary_logo', { value: e.target.value })}
                  placeholder="e.g. /images/logo.png or Media ID"
                />
                <Input
                  label="Favicon Media ID or Path"
                  value={formData.favicon?.value || ''}
                  onChange={(e) => handleFieldChange('favicon', { value: e.target.value })}
                  placeholder="e.g. /favicon.ico or Media ID"
                />
                <Input
                  label="Dark Mode Logo Media ID or Path"
                  value={formData.dark_logo?.value || ''}
                  onChange={(e) => handleFieldChange('dark_logo', { value: e.target.value })}
                  placeholder="e.g. /images/logo-dark.png"
                />
                <Input
                  label="Light Mode Logo Media ID or Path"
                  value={formData.light_logo?.value || ''}
                  onChange={(e) => handleFieldChange('light_logo', { value: e.target.value })}
                  placeholder="e.g. /images/logo-light.png"
                />
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="p-6 bg-white border border-slate-200/90 rounded-xl shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Chamber & Contact Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official contact details published across website headers, footers, and consultation modals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Office / Chamber Name (English)"
                  value={formData.office_name?.en || ''}
                  onChange={(e) => handleBilingualChange('office_name', 'en', e.target.value)}
                />
                <Input
                  label="Office / Chamber Name (Bangla)"
                  value={formData.office_name?.bn || ''}
                  onChange={(e) => handleBilingualChange('office_name', 'bn', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea
                  label="Physical Address (English)"
                  value={formData.address?.en || ''}
                  onChange={(e) => handleBilingualChange('address', 'en', e.target.value)}
                  rows={2}
                />
                <Textarea
                  label="Physical Address (Bangla)"
                  value={formData.address?.bn || ''}
                  onChange={(e) => handleBilingualChange('address', 'bn', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Chamber Phone Number"
                  value={formData.phone?.value || (typeof formData.phone === 'string' ? formData.phone : '')}
                  onChange={(e) => handleFieldChange('phone', { value: e.target.value })}
                  placeholder="+8801700000000"
                />
                <Input
                  label="Official Email"
                  type="email"
                  value={formData.email?.value || (typeof formData.email === 'string' ? formData.email : '')}
                  onChange={(e) => handleFieldChange('email', { value: e.target.value })}
                  placeholder="chamber@nijamuddin.com"
                />
                <Input
                  label="WhatsApp Number"
                  value={formData.whatsapp?.value || (typeof formData.whatsapp === 'string' ? formData.whatsapp : '')}
                  onChange={(e) => handleFieldChange('whatsapp', { value: e.target.value })}
                  placeholder="+8801700000000"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Business Hours (English)"
                  value={formData.business_hours?.en || ''}
                  onChange={(e) => handleBilingualChange('business_hours', 'en', e.target.value)}
                />
                <Input
                  label="Business Hours (Bangla)"
                  value={formData.business_hours?.bn || ''}
                  onChange={(e) => handleBilingualChange('business_hours', 'bn', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Social Links Tab */}
          {activeTab === 'social' && (
            <div className="p-6 bg-white border border-slate-200/90 rounded-xl shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Verified Social Profiles</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official social profiles and judicial media links (HTTPS protocol required).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Facebook Page URL"
                  value={formData.facebook?.value || (typeof formData.facebook === 'string' ? formData.facebook : '')}
                  onChange={(e) => handleFieldChange('facebook', { value: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
                <Input
                  label="LinkedIn Profile URL"
                  value={formData.linkedin?.value || (typeof formData.linkedin === 'string' ? formData.linkedin : '')}
                  onChange={(e) => handleFieldChange('linkedin', { value: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
                <Input
                  label="YouTube Channel URL"
                  value={formData.youtube?.value || (typeof formData.youtube === 'string' ? formData.youtube : '')}
                  onChange={(e) => handleFieldChange('youtube', { value: e.target.value })}
                  placeholder="https://youtube.com/@..."
                />
                <Input
                  label="X (Twitter) Profile URL"
                  value={formData.twitter?.value || (typeof formData.twitter === 'string' ? formData.twitter : '')}
                  onChange={(e) => handleFieldChange('twitter', { value: e.target.value })}
                  placeholder="https://x.com/..."
                />
              </div>
            </div>
          )}

          {/* SEO Settings Tab */}
          {activeTab === 'seo' && (
            <div className="p-6 bg-white border border-slate-200/90 rounded-xl shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Global SEO & Search Parameters</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Metadata tags, search crawler directives, and canonical settings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Default SEO Meta Title (English)"
                  value={formData.default_title?.en || ''}
                  onChange={(e) => handleBilingualChange('default_title', 'en', e.target.value)}
                />
                <Input
                  label="Default SEO Meta Title (Bangla)"
                  value={formData.default_title?.bn || ''}
                  onChange={(e) => handleBilingualChange('default_title', 'bn', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea
                  label="Default Meta Description (English)"
                  value={formData.default_description?.en || ''}
                  onChange={(e) => handleBilingualChange('default_description', 'en', e.target.value)}
                  rows={3}
                />
                <Textarea
                  label="Default Meta Description (Bangla)"
                  value={formData.default_description?.bn || ''}
                  onChange={(e) => handleBilingualChange('default_description', 'bn', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Robots Default Directive"
                  value={formData.robots_default?.value || (typeof formData.robots_default === 'string' ? formData.robots_default : '')}
                  onChange={(e) => handleFieldChange('robots_default', { value: e.target.value })}
                  placeholder="index, follow"
                />
                <Input
                  label="Canonical Domain"
                  value={formData.canonical_domain?.value || (typeof formData.canonical_domain === 'string' ? formData.canonical_domain : '')}
                  onChange={(e) => handleFieldChange('canonical_domain', { value: e.target.value })}
                  placeholder="https://nijamuddin.com"
                />
                <Input
                  label="Meta Keywords"
                  value={formData.default_keywords?.value || (typeof formData.default_keywords === 'string' ? formData.default_keywords : '')}
                  onChange={(e) => handleFieldChange('default_keywords', { value: e.target.value })}
                  placeholder="Advocate, Supreme Court, Legal Counsel"
                />
              </div>
            </div>
          )}

          {/* Global CTA Tab */}
          {activeTab === 'cta' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Enable Global Call to Action</h4>
                  <p className="text-xs text-slate-500">
                    When enabled, renders the prominent consultation CTA immediately above the footer on all public pages.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.global_cta?.is_enabled ?? true}
                    onChange={(e) => {
                      const current = formData.global_cta || {};
                      handleFieldChange('global_cta', { ...current, is_enabled: e.target.checked });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="CTA Heading (English)"
                  value={formData.global_cta?.heading?.en || ''}
                  onChange={(e) => {
                    const current = formData.global_cta || {};
                    handleFieldChange('global_cta', {
                      ...current,
                      heading: { ...(current.heading || {}), en: e.target.value },
                    });
                  }}
                  placeholder="Supreme Court Chamber Consultation & Strategic Advisory"
                />
                <Input
                  label="CTA Heading (Bangla)"
                  value={formData.global_cta?.heading?.bn || ''}
                  onChange={(e) => {
                    const current = formData.global_cta || {};
                    handleFieldChange('global_cta', {
                      ...current,
                      heading: { ...(current.heading || {}), bn: e.target.value },
                    });
                  }}
                  placeholder="সুপ্রিম কোর্ট চেম্বার পরামর্শ ও কৌশলগত আইনি সহায়তা"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea
                  label="CTA Subheading / Supporting Text (English)"
                  value={formData.global_cta?.subheading?.en || ''}
                  onChange={(e) => {
                    const current = formData.global_cta || {};
                    handleFieldChange('global_cta', {
                      ...current,
                      subheading: { ...(current.subheading || {}), en: e.target.value },
                    });
                  }}
                  rows={2}
                />
                <Textarea
                  label="CTA Subheading / Supporting Text (Bangla)"
                  value={formData.global_cta?.subheading?.bn || ''}
                  onChange={(e) => {
                    const current = formData.global_cta || {};
                    handleFieldChange('global_cta', {
                      ...current,
                      subheading: { ...(current.subheading || {}), bn: e.target.value },
                    });
                  }}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Primary Button Label (English)"
                  value={formData.global_cta?.primary_button_label?.en || ''}
                  onChange={(e) => {
                    const current = formData.global_cta || {};
                    handleFieldChange('global_cta', {
                      ...current,
                      primary_button_label: { ...(current.primary_button_label || {}), en: e.target.value },
                    });
                  }}
                  placeholder="Book Consultation"
                />
                <Input
                  label="Primary Button Label (Bangla)"
                  value={formData.global_cta?.primary_button_label?.bn || ''}
                  onChange={(e) => {
                    const current = formData.global_cta || {};
                    handleFieldChange('global_cta', {
                      ...current,
                      primary_button_label: { ...(current.primary_button_label || {}), bn: e.target.value },
                    });
                  }}
                  placeholder="পরামর্শ সম্মেলন বুক করুন"
                />
                <Input
                  label="Primary Button Destination URL"
                  value={formData.global_cta?.primary_button_url || ''}
                  onChange={(e) => {
                    const current = formData.global_cta || {};
                    handleFieldChange('global_cta', {
                      ...current,
                      primary_button_url: e.target.value,
                    });
                  }}
                  placeholder="/about#contact"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Secondary Button Label (English)"
                  value={formData.global_cta?.secondary_button_label?.en || ''}
                  onChange={(e) => {
                    const current = formData.global_cta || {};
                    handleFieldChange('global_cta', {
                      ...current,
                      secondary_button_label: { ...(current.secondary_button_label || {}), en: e.target.value },
                    });
                  }}
                  placeholder="Contact Chamber"
                />
                <Input
                  label="Secondary Button Label (Bangla)"
                  value={formData.global_cta?.secondary_button_label?.bn || ''}
                  onChange={(e) => {
                    const current = formData.global_cta || {};
                    handleFieldChange('global_cta', {
                      ...current,
                      secondary_button_label: { ...(current.secondary_button_label || {}), bn: e.target.value },
                    });
                  }}
                  placeholder="চেম্বার যোগাযোগ"
                />
                <Input
                  label="Secondary Button Destination URL"
                  value={formData.global_cta?.secondary_button_url || ''}
                  onChange={(e) => {
                    const current = formData.global_cta || {};
                    handleFieldChange('global_cta', {
                      ...current,
                      secondary_button_url: e.target.value,
                    });
                  }}
                  placeholder="/contact"
                />
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-white p-6 rounded-lg border border-legal-slate-200 shadow-sm space-y-5">
              <div className="flex items-center space-x-3 border-b border-legal-slate-200 pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-legal-gold-500/10 text-legal-gold-600">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-legal-slate-900">About Page Dynamic CMS Controls</h3>
                  <p className="text-xs text-legal-slate-500">
                    Comprehensive dynamic management for all 9 sections of the public About Page.
                  </p>
                </div>
              </div>

              <div className="text-sm text-legal-slate-700 leading-relaxed space-y-2">
                <p>
                  All About Page content is managed dynamically in the unified Lawyer Profile & About CMS Suite.
                  Both English and Bengali translations are fully editable for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-legal-slate-600 pl-2">
                  <li><strong>Hero Section:</strong> Stated headline, degree badge, action buttons, and portrait certification text.</li>
                  <li><strong>Section Headings:</strong> Custom eyebrow tags, titles, and descriptions for all 9 sections.</li>
                  <li><strong>Professional Highlights:</strong> 4 core distinction checklist items.</li>
                  <li><strong>Core Commitments:</strong> 4 pillars (Accessibility, Availability, Confidentiality, Integrity) with custom icons.</li>
                  <li><strong>Professional Development:</strong> Chronological training workshops, moot competitions, and inquiries.</li>
                  <li><strong>Chamber Locations & CTA:</strong> Consultation labels, chamber addresses, and statutory disclaimers.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-legal-slate-200 flex items-center justify-between">
                <span className="text-xs text-legal-slate-500">
                  Settings are stored in the database and synchronized instantly across EN/BN locales.
                </span>
                <Link
                  to="/admin/profile?tab=about_page"
                  className="inline-flex items-center rounded-md bg-legal-gold-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-legal-gold-500 focus:outline-none focus:ring-2 focus:ring-legal-gold-500"
                >
                  Open About Page CMS Editor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
