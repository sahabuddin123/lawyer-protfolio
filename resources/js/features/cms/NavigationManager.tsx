import React, { useState, useEffect } from 'react';
import { cmsApi } from '@/api/cms';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import { AdminPageHeader, AdminEmptyState, AdminConfirmationDialog } from '@/components/admin';
import { Compass, Plus, ArrowUp, ArrowDown, Eye, EyeOff, CornerDownRight } from 'lucide-react';
import type { Menu, MenuItem } from '@/types';

export const NavigationManager: React.FC = () => {
  const { showToast } = useToast();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state for menu item
  const [itemForm, setItemForm] = useState({
    title_en: '',
    title_bn: '',
    url: '',
    target: '_self' as '_self' | '_blank',
    parent_id: '' as '' | number,
    is_active: true,
  });

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      const data = await cmsApi.getAdminMenus();
      const list = Array.isArray(data) ? data : [];
      setMenus(list);
      if (list.length > 0 && !selectedMenuId) {
        setSelectedMenuId(list[0].id);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error loading menus',
        message: err.message || 'Could not fetch navigation menus.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentMenu = menus.find((m) => m.id === selectedMenuId);

  const handleOpenAddItem = (parentId?: number) => {
    setEditingItem(null);
    setItemForm({
      title_en: '',
      title_bn: '',
      url: '/',
      target: '_self',
      parent_id: parentId !== undefined ? parentId : '',
      is_active: true,
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: MenuItem) => {
    setEditingItem(item);
    const titleEn = typeof item.title === 'object' ? (item.title as any)?.en || '' : item.title;
    const titleBn = typeof item.title === 'object' ? (item.title as any)?.bn || '' : '';
    setItemForm({
      title_en: titleEn,
      title_bn: titleBn,
      url: item.url,
      target: (item.target as any) || '_self',
      parent_id: item.parent_id || '',
      is_active: (item as any).is_active ?? true,
    });
    setIsItemModalOpen(true);
  };

  const handleToggleItemActive = async (item: MenuItem) => {
    try {
      const currentActive = (item as any).is_active ?? true;
      const nextActive = !currentActive;
      await cmsApi.updateAdminMenuItem(item.id, {
        is_active: nextActive,
      });
      showToast({
        type: 'success',
        title: 'Navigation Status Updated',
        message: `Link '${typeof item.title === 'object' ? (item.title as any)?.en : item.title}' is now ${nextActive ? 'active' : 'disabled'}.`,
      });
      fetchMenus();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not toggle menu item status.',
      });
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMenu) return;

    if (!itemForm.title_en || !itemForm.url) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide both an English title and URL.',
      });
      return;
    }

    if (itemForm.url.toLowerCase().startsWith('javascript:') || itemForm.url.toLowerCase().startsWith('data:')) {
      showToast({
        type: 'error',
        title: 'Security Warning',
        message: 'Unsafe URL schemes (such as javascript: or data:) are rejected.',
      });
      return;
    }

    try {
      setIsSaving(true);
      const payload: any = {
        title: { en: itemForm.title_en, bn: itemForm.title_bn },
        url: itemForm.url,
        target: itemForm.target,
        parent_id: itemForm.parent_id ? Number(itemForm.parent_id) : null,
        is_active: itemForm.is_active,
      };

      if (editingItem) {
        await cmsApi.updateAdminMenuItem(editingItem.id, payload);
        showToast({
          type: 'success',
          title: 'Link Updated',
          message: `Menu link '${itemForm.title_en}' updated.`,
        });
      } else {
        await cmsApi.createAdminMenuItem({
          menu_id: currentMenu.id,
          ...payload,
          sort_order: (currentMenu.items?.length || 0) + 1,
        });
        showToast({
          type: 'success',
          title: 'Link Created',
          message: `Menu link '${itemForm.title_en}' added to ${currentMenu.title}.`,
        });
      }

      setIsItemModalOpen(false);
      fetchMenus();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Operation Failed',
        message: err.message || 'Could not save menu item.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteItem = async () => {
    if (!deletingItem) return;

    try {
      setIsDeleting(true);
      await cmsApi.deleteAdminMenuItem(deletingItem.id);
      showToast({
        type: 'success',
        title: 'Item Deleted',
        message: 'Menu link removed.',
      });
      setDeletingItem(null);
      fetchMenus();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Could not delete item.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = async (itemsList: MenuItem[], index: number, direction: 'up' | 'down') => {
    if (!currentMenu) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= itemsList.length) return;

    const currentItem = itemsList[index];
    const targetItem = itemsList[targetIndex];

    const updatedPayload = [
      { id: currentItem.id, sort_order: targetItem.sort_order, parent_id: currentItem.parent_id },
      { id: targetItem.id, sort_order: currentItem.sort_order, parent_id: targetItem.parent_id },
    ];

    try {
      await cmsApi.reorderAdminMenuItems(currentMenu.id, updatedPayload);
      fetchMenus();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Reorder Failed',
        message: err.message || 'Could not reorder items.',
      });
    }
  };

  // Helper to render an item row
  const renderItemRow = (item: MenuItem, idx: number, siblings: MenuItem[], isChild = false) => {
    const title = typeof item.title === 'object' ? (item.title as any)?.en || item.url : item.title;
    const titleBn = typeof item.title === 'object' ? (item.title as any)?.bn : '';
    const isActive = (item as any).is_active ?? true;

    return (
      <div
        key={item.id}
        className={`py-3 flex items-center justify-between gap-4 transition-colors ${
          isChild ? 'pl-8 bg-slate-50/50 hover:bg-slate-50 border-l-2 border-amber-300' : 'hover:bg-slate-50/80'
        }`}
      >
        <div className="flex items-center space-x-3 min-w-0">
          {isChild ? (
            <CornerDownRight className="w-4 h-4 text-amber-600 shrink-0 ml-1" />
          ) : (
            <span className="text-xs font-mono text-slate-400 w-6">#{idx + 1}</span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-xs truncate">{title}</span>
              {titleBn && (
                <span className="text-[11px] text-slate-500 font-serif truncate">
                  ({titleBn})
                </span>
              )}
              {isChild && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                  Dropdown Link
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-2 mt-0.5">
              <span className="text-amber-700">{item.url}</span>
              <span>&bull;</span>
              <span>Target: {item.target}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {/* Active / Inactive Toggle */}
          <button
            type="button"
            onClick={() => handleToggleItemActive(item)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
            title={isActive ? 'Click to disable' : 'Click to enable'}
          >
            {isActive ? (
              <>
                <Eye className="w-3 h-3" />
                <span>Active</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" />
                <span>Disabled</span>
              </>
            )}
          </button>

          {!isChild && (
            <button
              type="button"
              onClick={() => handleOpenAddItem(item.id)}
              className="px-2 py-1 rounded-lg text-amber-800 hover:bg-amber-50 border border-amber-200 text-[11px] font-medium transition-colors cursor-pointer"
              title="Add child submenu item"
            >
              + Submenu
            </button>
          )}

          <button
            type="button"
            disabled={idx === 0}
            onClick={() => handleMove(siblings, idx, 'up')}
            className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Move Up"
            aria-label="Move Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={idx === siblings.length - 1}
            onClick={() => handleMove(siblings, idx, 'down')}
            className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Move Down"
            aria-label="Move Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEditItem(item)}
            className="px-2.5 py-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeletingItem(item)}
            className="px-2.5 py-1 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 text-[11px] font-medium transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Navigation & Menu Taxonomies"
        description="Configure header, footer, and drawer menus, URL destinations, sequence order, dropdown submenus, and bilingual labels."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Compass className="w-3 h-3 text-amber-600" />
            <span>{(Array.isArray(menus) ? menus.length : 0)} Menus</span>
          </span>
        }
        actions={
          <Button
            variant="primary"
            onClick={() => handleOpenAddItem()}
            disabled={!currentMenu}
            className="bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </Button>
        }
      />

      {/* Menu Location Selector Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto">
        {(Array.isArray(menus) ? menus : []).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedMenuId(m.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              selectedMenuId === m.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{m.title}</span>
            <span className="text-[10px] text-slate-400 font-mono ml-1.5 uppercase">({m.location})</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3 bg-white rounded-xl border border-slate-200">
          <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading navigation links...</span>
        </div>
      ) : currentMenu ? (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">{currentMenu.title}</h3>
              <span className="text-xs font-mono text-amber-700">Location: {currentMenu.location}</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {currentMenu.items?.length || 0} Top-level Items
            </span>
          </div>

          {currentMenu.items && currentMenu.items.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {currentMenu.items.map((item, idx) => {
                const children = (item.children as MenuItem[]) || [];
                return (
                  <div key={item.id} className="space-y-1">
                    {renderItemRow(item, idx, currentMenu.items || [], false)}
                    {children.length > 0 && (
                      <div className="space-y-0.5 mb-2">
                        {children.map((child, cIdx) =>
                          renderItemRow(child, cIdx, children, true)
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <AdminEmptyState
              title="No Navigation Links"
              description={`The menu '${currentMenu.title}' does not contain any navigation links yet.`}
              actionLabel="+ Add First Link"
              onAction={() => handleOpenAddItem()}
            />
          )}
        </div>
      ) : null}

      {/* Add / Edit Item Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItem ? 'Edit Navigation Item' : `Add Item to ${currentMenu?.title}`}
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title (English)"
              value={itemForm.title_en}
              onChange={(e) => setItemForm({ ...itemForm, title_en: e.target.value })}
              placeholder="e.g. About Chamber"
              required
            />
            <Input
              label="Title (Bangla)"
              value={itemForm.title_bn}
              onChange={(e) => setItemForm({ ...itemForm, title_bn: e.target.value })}
              placeholder="যেমন: চেম্বার পরিচিতি"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Target URL"
              value={itemForm.url}
              onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
              placeholder="e.g. /about or https://..."
              required
            />
            <Select
              label="Open Target"
              value={itemForm.target}
              onChange={(e) => setItemForm({ ...itemForm, target: e.target.value as any })}
              options={[
                { value: '_self', label: 'Same Tab (_self)' },
                { value: '_blank', label: 'New Window Tab (_blank)' },
              ]}
            />
          </div>

          {/* Parent Item Dropdown for Submenus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Parent Menu Item (Dropdown Nesting)
              </label>
              <select
                value={itemForm.parent_id}
                onChange={(e) =>
                  setItemForm({
                    ...itemForm,
                    parent_id: e.target.value ? Number(e.target.value) : '',
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                <option value="">None (Top-Level Menu Item)</option>
                {(currentMenu?.items || [])
                  .filter((m) => !editingItem || m.id !== editingItem.id)
                  .map((m) => {
                    const title = typeof m.title === 'object' ? (m.title as any)?.en || m.url : m.title;
                    return (
                      <option key={m.id} value={m.id}>
                        {title}
                      </option>
                    );
                  })}
              </select>
            </div>

            <Select
              label="Visibility Status"
              value={itemForm.is_active ? '1' : '0'}
              onChange={(e) => setItemForm({ ...itemForm, is_active: e.target.value === '1' })}
              options={[
                { value: '1', label: 'Active (Visible publicly)' },
                { value: '0', label: 'Disabled (Hidden from public navigation)' },
              ]}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsItemModalOpen(false)}
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
              {editingItem ? 'Save Changes' : 'Add to Menu'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Item Deletion */}
      <AdminConfirmationDialog
        isOpen={Boolean(deletingItem)}
        title="Remove Navigation Link"
        message={`Are you sure you want to remove the link '${
          typeof deletingItem?.title === 'object'
            ? (deletingItem?.title as any)?.en || deletingItem?.url
            : deletingItem?.title
        }'?`}
        confirmLabel="Remove Link"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDeleteItem}
        onClose={() => setDeletingItem(null)}
      />
    </div>
  );
};
