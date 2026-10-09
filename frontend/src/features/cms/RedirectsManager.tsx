import React, { useState, useEffect } from 'react';
import { cmsApi } from '@/api/cms';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import type { Redirect } from '@/types';

export const RedirectsManager: React.FC = () => {
  const { showToast } = useToast();
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    source_url: '',
    target_url: '',
    status_code: 301,
    is_active: true,
  });

  useEffect(() => {
    fetchRedirects();
  }, [searchQuery]);

  const fetchRedirects = async () => {
    try {
      setIsLoading(true);
      const res = await cmsApi.getAdminRedirects({ q: searchQuery });
      setRedirects(res.data);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error loading redirects',
        message: err.message || 'Could not fetch redirects.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingRedirect(null);
    setFormData({
      source_url: '/',
      target_url: '/',
      status_code: 301,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (red: Redirect) => {
    setEditingRedirect(red);
    setFormData({
      source_url: red.source_url,
      target_url: red.target_url,
      status_code: red.status_code,
      is_active: red.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.source_url === formData.target_url) {
      showToast({
        type: 'error',
        title: 'Redirect Loop Detected',
        message: 'Source and Target URLs cannot be identical.',
      });
      return;
    }

    try {
      setIsSaving(true);
      if (editingRedirect) {
        await cmsApi.updateAdminRedirect(editingRedirect.id, formData);
        showToast({
          type: 'success',
          title: 'Redirect Updated',
          message: 'URL redirect rule saved.',
        });
      } else {
        await cmsApi.createAdminRedirect(formData);
        showToast({
          type: 'success',
          title: 'Redirect Created',
          message: 'URL redirect rule added.',
        });
      }

      setIsModalOpen(false);
      fetchRedirects();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.response?.data?.message || err.message || 'Could not save redirect.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (red: Redirect) => {
    if (!window.confirm(`Delete redirect from '${red.source_url}'?`)) return;

    try {
      await cmsApi.deleteAdminRedirect(red.id);
      showToast({
        type: 'success',
        title: 'Redirect Removed',
        message: 'URL redirect rule deleted.',
      });
      fetchRedirects();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Could not delete redirect.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-legal-gold/20 gap-4">
        <div>
          <h2 className="text-2xl font-serif text-white tracking-wide">URL Redirect Management</h2>
          <p className="text-sm text-neutral-400 font-sans">
            Manage permanent (301) and temporary (302) URL forwardings, preserve legacy SEO link equity, and prevent broken links.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          + New Redirect Rule
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search redirects by source or target URL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <span className="text-xs text-neutral-500 font-sans">{redirects.length} Rules Active</span>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-legal-gold flex items-center justify-center space-x-3">
          <div className="w-5 h-5 border-2 border-legal-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-sans tracking-wide">Loading Redirects...</span>
        </div>
      ) : (
        <div className="overflow-x-auto border border-neutral-800 rounded-lg">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-900 border-b border-neutral-800 text-xs text-legal-gold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Source URL</th>
                <th className="py-3 px-4">Destination Target</th>
                <th className="py-3 px-4">Status Code</th>
                <th className="py-3 px-4">Hit Count</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {redirects.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-900/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-amber-300">{r.source_url}</td>
                  <td className="py-3 px-4 font-mono text-xs text-neutral-300">{r.target_url}</td>
                  <td className="py-3 px-4">
                    <Badge variant={r.status_code === 301 ? 'gold' : 'neutral'} size="sm">
                      {r.status_code}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-neutral-400">{r.hit_count} Hits</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(r)}>
                      Edit
                    </Button>
                    <Button variant="ghost" className="text-status-error hover:bg-status-error/10" size="sm" onClick={() => handleDelete(r)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {redirects.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500">
                    No active redirect rules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRedirect ? 'Edit Redirect Rule' : 'Create New Redirect Rule'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Source URL (Legacy / Incoming Path)"
            value={formData.source_url}
            onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
            placeholder="/old-legal-page"
            required
          />

          <Input
            label="Destination Target URL"
            value={formData.target_url}
            onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
            placeholder="/practice-areas/constitutional"
            required
          />

          <Select
            label="HTTP Redirect Code"
            value={formData.status_code.toString()}
            onChange={(e) => setFormData({ ...formData, status_code: parseInt(e.target.value, 10) })}
            options={[
              { value: '301', label: '301 — Moved Permanently (Recommended for SEO)' },
              { value: '302', label: '302 — Found / Temporary Redirect' },
              { value: '307', label: '307 — Temporary Redirect (Method Preserving)' },
              { value: '308', label: '308 — Permanent Redirect (Method Preserving)' },
            ]}
          />

          <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-800">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSaving}>
              {editingRedirect ? 'Save Changes' : 'Create Rule'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
