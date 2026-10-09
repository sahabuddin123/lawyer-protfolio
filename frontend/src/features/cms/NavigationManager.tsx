import React, { useState, useEffect } from 'react';
import { cmsApi } from '@/api/cms';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Modal } from '@/components/modals/Modal';
import { useToast } from '@/components/feedback/Toast';
import type { Menu, MenuItem } from '@/types';

export const NavigationManager: React.FC = () => {
  const { showToast } = useToast();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for menu item
  const [itemForm, setItemForm] = useState({
    title_en: '',
    title_bn: '',
    url: '',
    target: '_self' as '_self' | '_blank',
  });

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      const data = await cmsApi.getAdminMenus();
      setMenus(data);
      if (data.length > 0 && !selectedMenuId) {
        setSelectedMenuId(data[0].id);
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

  const handleOpenAddItem = () => {
    setEditingItem(null);
    setItemForm({
      title_en: '',
      title_bn: '',
      url: '/',
      target: '_self',
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
      target: item.target,
    });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMenu) return;

    try {
      setIsSaving(true);
      const payload = {
        menu_id: currentMenu.id,
        title: { en: itemForm.title_en, bn: itemForm.title_bn },
        url: itemForm.url,
        target: itemForm.target,
      };

      if (editingItem) {
        await cmsApi.updateAdminMenuItem(editingItem.id, payload);
        showToast({
          type: 'success',
          title: 'Menu Item Updated',
          message: 'Navigation item saved.',
        });
      } else {
        await cmsApi.createAdminMenuItem(payload);
        showToast({
          type: 'success',
          title: 'Menu Item Created',
          message: 'Navigation item added to menu.',
        });
      }

      setIsItemModalOpen(false);
      fetchMenus();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.response?.data?.message || err.message || 'Could not save navigation item.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to remove this navigation item?')) return;

    try {
      await cmsApi.deleteAdminMenuItem(itemId);
      showToast({
        type: 'success',
        title: 'Item Deleted',
        message: 'Menu item removed.',
      });
      fetchMenus();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Could not delete item.',
      });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!currentMenu || !currentMenu.items) return;
    const items = [...currentMenu.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= items.length) return;

    // Swap sort orders
    const currentItem = items[index];
    const targetItem = items[targetIndex];

    const updatedPayload = [
      { id: currentItem.id, sort_order: targetItem.sort_order },
      { id: targetItem.id, sort_order: currentItem.sort_order },
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-legal-gold/20 gap-4">
        <div>
          <h2 className="text-2xl font-serif text-white tracking-wide">Navigation & Menu Management</h2>
          <p className="text-sm text-neutral-400 font-sans">
            Configure header, footer, and legal drawer menus, URL destinations, and bilingual labels.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAddItem} disabled={!currentMenu}>
          + Add Menu Item
        </Button>
      </div>

      {/* Menu Selector Tabs */}
      <div className="flex gap-2 border-b border-neutral-800 pb-2">
        {menus.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedMenuId(m.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
              selectedMenuId === m.id
                ? 'bg-neutral-800 text-legal-gold border-b-2 border-legal-gold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            {m.title} ({m.location})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-legal-gold flex items-center justify-center space-x-3">
          <div className="w-5 h-5 border-2 border-legal-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-sans tracking-wide">Loading Navigation...</span>
        </div>
      ) : currentMenu ? (
        <Card className="p-6 bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-lg font-serif text-white">{currentMenu.title}</h3>
              <span className="text-xs font-mono text-legal-gold">Location: {currentMenu.location}</span>
            </div>
            <span className="text-xs text-neutral-400">
              {currentMenu.items?.length || 0} Total Navigation Links
            </span>
          </div>

          <div className="divide-y divide-neutral-800">
            {currentMenu.items?.map((item, idx) => {
              const title = typeof item.title === 'object' ? (item.title as any)?.en || item.url : item.title;
              const titleBn = typeof item.title === 'object' ? (item.title as any)?.bn : '';
              return (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-neutral-500 w-6">#{idx + 1}</span>
                    <div>
                      <span className="font-medium text-white">{title}</span>
                      {titleBn && <span className="text-xs text-neutral-400 ml-2 font-bengali">({titleBn})</span>}
                      <div className="text-xs text-neutral-400 font-mono flex items-center space-x-2">
                        <span>{item.url}</span>
                        <span className="text-neutral-600">•</span>
                        <span>Target: {item.target}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-white text-xs"
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === (currentMenu.items?.length || 1) - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-white text-xs"
                      title="Move Down"
                    >
                      ▼
                    </button>
                    <Button variant="secondary" size="sm" onClick={() => handleOpenEditItem(item)}>
                      Edit
                    </Button>
                    <Button variant="ghost" className="text-status-error hover:bg-status-error/10" size="sm" onClick={() => handleDeleteItem(item.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
            {(!currentMenu.items || currentMenu.items.length === 0) && (
              <p className="py-6 text-center text-sm text-neutral-500">
                No items have been assigned to this menu yet. Click 'Add Menu Item' above.
              </p>
            )}
          </div>
        </Card>
      ) : null}

      {/* Add / Edit Menu Item Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItem ? 'Edit Navigation Item' : 'Add New Navigation Item'}
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Label (English)"
              value={itemForm.title_en}
              onChange={(e) => setItemForm({ ...itemForm, title_en: e.target.value })}
              required
            />
            <Input
              label="Label (Bangla)"
              value={itemForm.title_bn}
              onChange={(e) => setItemForm({ ...itemForm, title_bn: e.target.value })}
            />
          </div>

          <Input
            label="Destination URL / Route"
            value={itemForm.url}
            onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
            placeholder="/practice-areas or https://..."
            required
          />

          <Select
            label="Window Target"
            value={itemForm.target}
            onChange={(e) => setItemForm({ ...itemForm, target: e.target.value as '_self' | '_blank' })}
            options={[
              { value: '_self', label: 'Same Window / Internal Tab (_self)' },
              { value: '_blank', label: 'New Window / External Tab (_blank)' },
            ]}
          />

          <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-800">
            <Button variant="secondary" onClick={() => setIsItemModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSaving}>
              {editingItem ? 'Save Item' : 'Add to Menu'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
