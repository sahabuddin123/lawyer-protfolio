import React, { useState, useEffect } from 'react';
import { cmsApi } from '@/api/cms';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { useToast } from '@/components/feedback/Toast';
import type { SiteSetting } from '@/types';

export const SettingsManager: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'social' | 'seo' | 'branding'>('general');
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
      setSettings(data);

      const map: Record<string, any> = {};
      data.forEach((s) => {
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

  if (isLoading) {
    return (
      <div className="p-8 text-center text-legal-gold flex items-center justify-center space-x-3">
        <div className="w-5 h-5 border-2 border-legal-gold border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-sans tracking-wide">Loading System Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-legal-gold/20 gap-4">
        <div>
          <h2 className="text-2xl font-serif text-white tracking-wide">Site Settings & Configuration</h2>
          <p className="text-sm text-neutral-400 font-sans">
            Manage global website metadata, branding, chamber contact details, and SEO parameters.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
              Unsaved Changes
            </span>
          )}
          <Button
            type="submit"
            form="settings-form"
            variant="primary"
            isLoading={isSaving}
            disabled={!hasChanges || isSaving}
          >
            Save All Settings
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-2">
        {(['general', 'branding', 'contact', 'social', 'seo'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
              activeTab === tab
                ? 'bg-neutral-800 text-legal-gold border-b-2 border-legal-gold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Settings
          </button>
        ))}
      </div>

      <form id="settings-form" onSubmit={handleSave} className="space-y-6">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <Card className="p-6 bg-neutral-900 border border-neutral-800 space-y-5">
            <h3 className="text-lg font-serif text-legal-gold">General Website Configuration</h3>
            
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
          </Card>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <Card className="p-6 bg-neutral-900 border border-neutral-800 space-y-5">
            <h3 className="text-lg font-serif text-legal-gold">Branding & Logo Assets</h3>
            <p className="text-xs text-neutral-400">
              Media library file ID references for official judicial headers, footers, and favicons.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Primary Logo Media ID"
                value={formData.primary_logo?.value || ''}
                onChange={(e) => handleFieldChange('primary_logo', { value: e.target.value })}
                placeholder="Media ID or Path"
              />
              <Input
                label="Favicon Media ID"
                value={formData.favicon?.value || ''}
                onChange={(e) => handleFieldChange('favicon', { value: e.target.value })}
                placeholder="Media ID or Path"
              />
              <Input
                label="Dark Mode Logo Media ID"
                value={formData.dark_logo?.value || ''}
                onChange={(e) => handleFieldChange('dark_logo', { value: e.target.value })}
                placeholder="Media ID or Path"
              />
              <Input
                label="Light Mode Logo Media ID"
                value={formData.light_logo?.value || ''}
                onChange={(e) => handleFieldChange('light_logo', { value: e.target.value })}
                placeholder="Media ID or Path"
              />
            </div>
          </Card>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <Card className="p-6 bg-neutral-900 border border-neutral-800 space-y-5">
            <h3 className="text-lg font-serif text-legal-gold">Chamber & Contact Information</h3>
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
          </Card>
        )}

        {/* Social Links Tab */}
        {activeTab === 'social' && (
          <Card className="p-6 bg-neutral-900 border border-neutral-800 space-y-5">
            <h3 className="text-lg font-serif text-legal-gold">Verified Social Profiles</h3>
            <p className="text-xs text-neutral-400">
              Only standard secure protocols (HTTPS) are permitted.
            </p>
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
          </Card>
        )}

        {/* SEO Settings Tab */}
        {activeTab === 'seo' && (
          <Card className="p-6 bg-neutral-900 border border-neutral-800 space-y-5">
            <h3 className="text-lg font-serif text-legal-gold">Global SEO & Search Parameters</h3>
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
          </Card>
        )}
      </form>
    </div>
  );
};
