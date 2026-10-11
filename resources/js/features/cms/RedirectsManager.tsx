import React, { useState, useEffect } from 'react';
import { cmsApi } from '@/api/cms';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import { AdminPageHeader, AdminEmptyState, AdminConfirmationDialog } from '@/components/admin';
import { ArrowLeftRight, Plus, Search } from 'lucide-react';
import type { Redirect } from '@/types';

export const RedirectsManager: React.FC = () => {
  const { showToast } = useToast();
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
  const [deletingRedirect, setDeletingRedirect] = useState<Redirect | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      const res: any = await cmsApi.getAdminRedirects({ q: searchQuery });
      const redList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setRedirects(redList);
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
    if (!formData.source_url || !formData.target_url) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Both source URL and destination target are mandatory.',
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
          message: `Forwarding rule for '${formData.source_url}' updated.`,
        });
      } else {
        await cmsApi.createAdminRedirect(formData);
        showToast({
          type: 'success',
          title: 'Redirect Created',
          message: `Forwarding rule from '${formData.source_url}' to '${formData.target_url}' established.`,
        });
      }
      setIsModalOpen(false);
      fetchRedirects();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not save redirect rule.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingRedirect) return;

    try {
      setIsDeleting(true);
      await cmsApi.deleteAdminRedirect(deletingRedirect.id);
      showToast({
        type: 'success',
        title: 'Redirect Removed',
        message: 'URL redirect rule deleted.',
      });
      setDeletingRedirect(null);
      fetchRedirects();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Could not delete redirect.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="SEO & Permanent URL Redirects"
        description="Manage permanent (301) and temporary (302) URL forwardings, preserve legacy SEO link equity, and prevent broken links."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <ArrowLeftRight className="w-3 h-3 text-amber-600" />
            <span>{(Array.isArray(redirects) ? redirects.length : 0)} Rules</span>
          </span>
        }
        actions={
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Redirect Rule</span>
          </Button>
        }
      />

      {/* Search & Statistics Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search redirects by source or target URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {(Array.isArray(redirects) ? redirects.length : 0)} Active Forwarding Rules
        </span>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3 bg-white rounded-xl border border-slate-200">
          <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading forwarding rules...</span>
        </div>
      ) : (!Array.isArray(redirects) || redirects.length === 0) ? (
        <AdminEmptyState
          title="No Redirect Rules Configured"
          description={
            searchQuery
              ? `No forwarding rules matching "${searchQuery}" were found.`
              : 'Preserve SEO authority and avoid 404 dead ends by creating permanent 301 redirects.'
          }
          actionLabel="+ New Redirect Rule"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Source URL</th>
                  <th className="py-3 px-4">Destination Target</th>
                  <th className="py-3 px-4">HTTP Status</th>
                  <th className="py-3 px-4">Hits</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Array.isArray(redirects) ? redirects : []).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-amber-700 font-semibold">
                      {r.source_url}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700">{r.target_url}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {r.status_code} {r.status_code === 301 ? 'Permanent' : 'Temporary'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{r.hit_count || 0}</td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(r)}
                        className="px-2.5 py-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingRedirect(r)}
                        className="px-2.5 py-1 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRedirect ? 'Edit Redirect Rule' : 'Create New Redirect Rule'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Source URL (Path to intercept)"
            value={formData.source_url}
            onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
            placeholder="e.g. /old-law-article or /old-bio"
            required
          />
          <Input
            label="Destination Target URL"
            value={formData.target_url}
            onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
            placeholder="e.g. /publications/constitutional-paper or /about"
            required
          />
          <Select
            label="HTTP Redirect Code"
            value={String(formData.status_code)}
            onChange={(e) => setFormData({ ...formData, status_code: parseInt(e.target.value, 10) })}
            options={[
              { value: '301', label: '301 — Moved Permanently (Passes SEO Authority)' },
              { value: '302', label: '302 — Moved Temporarily (Temporary Campaign)' },
            ]}
          />

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSaving}
              className="bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-xs"
            >
              {editingRedirect ? 'Save Changes' : 'Create Redirect'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Deletion */}
      <AdminConfirmationDialog
        isOpen={Boolean(deletingRedirect)}
        title="Delete URL Redirect Rule"
        message={`Are you sure you wish to delete the redirect rule for '${deletingRedirect?.source_url}'?`}
        confirmLabel="Delete Rule"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeletingRedirect(null)}
      />
    </div>
  );
};
