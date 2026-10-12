import React, { useState } from 'react';
import {
  Layers,
  Component,
  Sliders,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Scale,
  Type,
  AlignLeft,
  Link,
  Share2,
  MapPin,
  Phone,
  Minus,
  ArrowUp,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import type {
  FooterLayoutData,
  FooterRow,
  FooterColumn,
  FooterElement,
  ElementType,
  CanonicalData,
} from '../types';

interface BuilderSidebarProps {
  layout: FooterLayoutData;
  selectedId: string | null;
  selectedType: 'element' | 'column' | 'row' | 'root' | null;
  onSelect: (id: string | null, type: 'element' | 'column' | 'row' | 'root' | null) => void;
  onAddElement: (type: ElementType, columnId?: string) => void;
  onUpdateElement: (elementId: string, updates: Partial<FooterElement>) => void;
  onUpdateColumn: (columnId: string, updates: Partial<FooterColumn>) => void;
  onUpdateRow: (rowId: string, updates: Partial<FooterRow>) => void;
  onUpdateRootSettings: (settings: any) => void;
  onDeleteElement: (elementId: string) => void;
  onDuplicateElement: (elementId: string) => void;
  onMoveElement: (elementId: string, direction: 'up' | 'down') => void;
  onDeleteRow: (rowId: string) => void;
  onAddRow: () => void;
  canonicalData: CanonicalData | null;
  activeLocale: 'en' | 'bn';
}

const ELEMENT_CATALOG: Array<{
  category: string;
  items: Array<{ type: ElementType; label: string; icon: React.ElementType; description: string }>;
}> = [
  {
    category: 'Branding & Content',
    items: [
      { type: 'site_identity', label: 'Site Identity', icon: Scale, description: 'Scale emblem, lawyer name & designation' },
      { type: 'heading', label: 'Heading', icon: Type, description: 'Gold section title or navigation heading' },
      { type: 'paragraph', label: 'Paragraph', icon: AlignLeft, description: 'Editorial bio or descriptive text' },
      { type: 'custom_link_group', label: 'Link Group', icon: Link, description: 'Curated list of practice area or navigation links' },
    ],
  },
  {
    category: 'Chamber & Contact',
    items: [
      { type: 'chambers_list', label: 'Chamber Locations', icon: MapPin, description: 'Supreme Court & Chattogram Chamber addresses' },
      { type: 'contact_group', label: 'Phone & Email', icon: Phone, description: 'Validated tel: and mailto: contact strip' },
      { type: 'social_group', label: 'Social Media', icon: Share2, description: 'Verified social icons (Facebook, LinkedIn, YouTube)' },
    ],
  },
  {
    category: 'Legal & Utility',
    items: [
      { type: 'divider', label: 'Gold Divider', icon: Minus, description: 'Horizontal divider line with optional scale emblem' },
      { type: 'legal_disclaimer', label: 'Disclaimer Notice', icon: ShieldAlert, description: 'Standard legal counsel disclaimer' },
      { type: 'legal_links', label: 'Bottom Bar & Legal Links', icon: Link, description: 'Copyright with dynamic year, Privacy, Terms' },
      { type: 'back_to_top', label: 'Back to Top', icon: ArrowUp, description: 'Smooth scroll to top of page button' },
    ],
  },
];

export const BuilderSidebar: React.FC<BuilderSidebarProps> = ({
  layout,
  selectedId,
  selectedType,
  onSelect,
  onAddElement,
  onUpdateElement,
  onUpdateColumn,
  onUpdateRow,
  onUpdateRootSettings,
  onDeleteElement,
  onDuplicateElement,
  onMoveElement,
  onDeleteRow,
  onAddRow,
  canonicalData: _canonicalData,
  activeLocale,
}) => {
  const [activeTab, setActiveTab] = useState<'elements' | 'layers' | 'inspector'>(
    selectedId ? 'inspector' : 'elements'
  );
  const [editingLang, setEditingLang] = useState<'en' | 'bn'>(activeLocale);

  // Find currently selected entity
  let selectedElement: FooterElement | null = null;
  let selectedColumn: FooterColumn | null = null;
  let selectedRow: FooterRow | null = null;

  for (const row of layout.rows) {
    if (selectedType === 'row' && row.id === selectedId) {
      selectedRow = row;
      break;
    }
    for (const col of row.columns) {
      if (selectedType === 'column' && col.id === selectedId) {
        selectedColumn = col;
        selectedRow = row;
        break;
      }
      for (const el of col.elements) {
        if (selectedType === 'element' && el.id === selectedId) {
          selectedElement = el;
          selectedColumn = col;
          selectedRow = row;
          break;
        }
      }
    }
  }

  return (
    <div className="w-80 h-full flex flex-col bg-slate-900 border-r border-slate-800 text-slate-200 select-none">
      {/* Sidebar Nav Tabs */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('elements')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'elements'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Component className="w-3.5 h-3.5" />
          <span>Elements</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'layers'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Layers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inspector')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'inspector'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>

      {/* Tab 1: Elements Catalog */}
      {activeTab === 'elements' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="text-[11px] text-slate-400">
            Click any element below to insert it into the current column.
          </div>

          {ELEMENT_CATALOG.map((cat, idx) => (
            <div key={idx} className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {cat.category}
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => {
                        onAddElement(item.type, selectedColumn?.id);
                        setActiveTab('inspector');
                      }}
                      className="w-full text-left p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 transition-all group flex items-start gap-3 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-medium text-slate-200 group-hover:text-amber-300">
                          {item.label}
                        </span>
                        <span className="block text-[10px] text-slate-400 truncate">
                          {item.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-2">
            <button
              type="button"
              onClick={onAddRow}
              className="w-full py-2.5 rounded-lg border border-dashed border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/10 text-amber-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Row</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Layers Tree / Navigator */}
      {activeTab === 'layers' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
            <span>DOM Structure Tree</span>
            <button
              type="button"
              onClick={() => onSelect(null, 'root')}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Global Settings
            </button>
          </div>

          {layout.rows.map((row, rIdx) => (
            <div
              key={row.id}
              className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40"
            >
              {/* Row Header */}
              <div
                onClick={() => onSelect(row.id, 'row')}
                className={`p-2 text-xs flex items-center justify-between cursor-pointer ${
                  selectedType === 'row' && selectedId === row.id
                    ? 'bg-amber-500/20 text-amber-300 border-l-2 border-amber-400 font-bold'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-mono text-[10px] text-slate-500">#{rIdx + 1}</span>
                  <span className="truncate">Row ({row.columns.length} cols)</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRow(row.id);
                    }}
                    title="Delete Row"
                    className="p-1 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Columns Tree */}
              <div className="pl-3 pr-1 py-1 space-y-1">
                {row.columns.map((col, cIdx) => (
                  <div key={col.id} className="space-y-1">
                    <div
                      onClick={() => onSelect(col.id, 'column')}
                      className={`p-1.5 rounded text-[11px] flex items-center justify-between cursor-pointer ${
                        selectedType === 'column' && selectedId === col.id
                          ? 'bg-amber-500/15 text-amber-300 font-semibold border-l-2 border-amber-400'
                          : 'text-slate-400 hover:bg-slate-800/40'
                      }`}
                    >
                      <span className="truncate">
                        Column {cIdx + 1} (span {col.span})
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {col.elements.length} els
                      </span>
                    </div>

                    {/* Elements */}
                    <div className="pl-3 space-y-0.5">
                      {col.elements.map((el) => (
                        <div
                          key={el.id}
                          onClick={() => onSelect(el.id, 'element')}
                          className={`p-1.5 rounded text-xs flex items-center justify-between cursor-pointer group ${
                            selectedType === 'element' && selectedId === el.id
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                              : 'text-slate-300 hover:bg-slate-800/60'
                          }`}
                        >
                          <span className="truncate text-[11px]">
                            {el.type.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveElement(el.id, 'up');
                              }}
                              className="p-0.5 hover:text-amber-400"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveElement(el.id, 'down');
                              }}
                              className="p-0.5 hover:text-amber-400"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteElement(el.id);
                              }}
                              className="p-0.5 hover:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Settings & Inspector */}
      {activeTab === 'inspector' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Element Inspector */}
          {selectedType === 'element' && selectedElement && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 block font-bold">
                    Editing Element
                  </span>
                  <span className="text-xs font-semibold text-slate-100 capitalize">
                    {selectedElement.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onDuplicateElement(selectedElement!.id)}
                    title="Duplicate Element"
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteElement(selectedElement!.id)}
                    title="Delete Element"
                    className="p-1 rounded bg-slate-800 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Language Switcher for Bilingual Content Editing */}
              <div className="flex items-center justify-between bg-slate-950 p-1 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium pl-2">Field Language:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingLang('en')}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                      editingLang === 'en'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    EN (English)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingLang('bn')}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                      editingLang === 'bn'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    BN (বাংলা)
                  </button>
                </div>
              </div>

              {/* Content Form Fields based on Type */}
              <div className="space-y-3">
                {/* Heading / Title / Paragraph text */}
                {(selectedElement.type === 'heading' || selectedElement.type === 'paragraph' || selectedElement.type === 'legal_disclaimer') && (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">
                      {editingLang === 'en' ? 'Text Content (English)' : 'টেক্সট বিষয়বস্তু (বাংলা)'}
                    </label>
                    <textarea
                      rows={selectedElement.type === 'paragraph' || selectedElement.type === 'legal_disclaimer' ? 4 : 2}
                      value={
                        typeof selectedElement.content.text === 'object'
                          ? selectedElement.content.text?.[editingLang] || ''
                          : selectedElement.content.text || ''
                      }
                      onChange={(e) => {
                        const currentObj = typeof selectedElement!.content.text === 'object' ? selectedElement!.content.text : {};
                        onUpdateElement(selectedElement!.id, {
                          content: {
                            ...selectedElement!.content,
                            text: { ...currentObj, [editingLang]: e.target.value },
                          },
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-100 focus:outline-hidden focus:border-amber-400 font-sans"
                    />
                  </div>
                )}

                {/* Site Identity */}
                {selectedElement.type === 'site_identity' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">
                        Lawyer Name ({editingLang.toUpperCase()})
                      </label>
                      <input
                        type="text"
                        value={selectedElement.content.lawyer_name?.[editingLang] || ''}
                        onChange={(e) => {
                          onUpdateElement(selectedElement!.id, {
                            content: {
                              ...selectedElement!.content,
                              lawyer_name: {
                                ...selectedElement!.content.lawyer_name,
                                [editingLang]: e.target.value,
                              },
                            },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-100 focus:outline-hidden focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">
                        Designation ({editingLang.toUpperCase()})
                      </label>
                      <input
                        type="text"
                        value={selectedElement.content.designation?.[editingLang] || ''}
                        onChange={(e) => {
                          onUpdateElement(selectedElement!.id, {
                            content: {
                              ...selectedElement!.content,
                              designation: {
                                ...selectedElement!.content.designation,
                                [editingLang]: e.target.value,
                              },
                            },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-100 focus:outline-hidden focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                {/* Chambers List Editor */}
                {selectedElement.type === 'chambers_list' && (
                  <div className="space-y-3">
                    <span className="text-[11px] text-amber-400 font-semibold block">
                      Canonical Chamber Records
                    </span>
                    {(selectedElement.content.chambers || []).map((ch, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">
                          Chamber #{idx + 1}
                        </span>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Name ({editingLang})</label>
                          <input
                            type="text"
                            value={ch.name?.[editingLang] || ''}
                            onChange={(e) => {
                              const list = [...(selectedElement!.content.chambers || [])];
                              list[idx] = { ...list[idx], name: { ...list[idx].name, [editingLang]: e.target.value } };
                              onUpdateElement(selectedElement!.id, {
                                content: { ...selectedElement!.content, chambers: list },
                              });
                            }}
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Address ({editingLang})</label>
                          <textarea
                            rows={2}
                            value={ch.address?.[editingLang] || ''}
                            onChange={(e) => {
                              const list = [...(selectedElement!.content.chambers || [])];
                              list[idx] = { ...list[idx], address: { ...list[idx].address, [editingLang]: e.target.value } };
                              onUpdateElement(selectedElement!.id, {
                                content: { ...selectedElement!.content, chambers: list },
                              });
                            }}
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Google Maps URL</label>
                          <input
                            type="url"
                            value={ch.map_url || ''}
                            onChange={(e) => {
                              const list = [...(selectedElement!.content.chambers || [])];
                              list[idx] = { ...list[idx], map_url: e.target.value };
                              onUpdateElement(selectedElement!.id, {
                                content: { ...selectedElement!.content, chambers: list },
                              });
                            }}
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Contact Group Editor */}
                {selectedElement.type === 'contact_group' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">Telephone (tel:)</label>
                      <input
                        type="text"
                        value={selectedElement.content.phone || ''}
                        onChange={(e) => {
                          onUpdateElement(selectedElement!.id, {
                            content: { ...selectedElement!.content, phone: e.target.value },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-slate-100"
                      />
                      {(selectedElement.content.phone || '').includes('000000') && (
                        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-400 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Suspected placeholder phone number. Please update with verified chamber phone.</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">Email (mailto:)</label>
                      <input
                        type="email"
                        value={selectedElement.content.email || ''}
                        onChange={(e) => {
                          onUpdateElement(selectedElement!.id, {
                            content: { ...selectedElement!.content, email: e.target.value },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-slate-100"
                      />
                    </div>
                  </div>
                )}

                {/* Style Controls */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                    Style & Typography
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block">Text Color</label>
                      <input
                        type="color"
                        value={selectedElement.settings.color || '#94A3B8'}
                        onChange={(e) => {
                          onUpdateElement(selectedElement!.id, {
                            settings: { ...selectedElement!.settings, color: e.target.value },
                          });
                        }}
                        className="w-full h-8 bg-transparent rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Font Size</label>
                      <select
                        value={selectedElement.settings.font_size || 'text-xs'}
                        onChange={(e) => {
                          onUpdateElement(selectedElement!.id, {
                            settings: { ...selectedElement!.settings, font_size: e.target.value },
                          });
                        }}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
                      >
                        <option value="text-[11px]">Extra Small (11px)</option>
                        <option value="text-xs">Small (12px)</option>
                        <option value="text-sm">Regular (14px)</option>
                        <option value="text-base">Medium (16px)</option>
                        <option value="text-lg">Large (18px)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Responsive Visibility Controls */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                    Visibility by Device
                  </span>
                  <div className="space-y-1 text-xs">
                    <label className="flex items-center gap-2 text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedElement.settings.hide_desktop || false}
                        onChange={(e) => {
                          onUpdateElement(selectedElement!.id, {
                            settings: { ...selectedElement!.settings, hide_desktop: e.target.checked },
                          });
                        }}
                        className="rounded border-slate-700 bg-slate-950 text-amber-500"
                      />
                      <span>Hide on Desktop</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedElement.settings.hide_tablet || false}
                        onChange={(e) => {
                          onUpdateElement(selectedElement!.id, {
                            settings: { ...selectedElement!.settings, hide_tablet: e.target.checked },
                          });
                        }}
                        className="rounded border-slate-700 bg-slate-950 text-amber-500"
                      />
                      <span>Hide on Tablet</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedElement.settings.hide_mobile || false}
                        onChange={(e) => {
                          onUpdateElement(selectedElement!.id, {
                            settings: { ...selectedElement!.settings, hide_mobile: e.target.checked },
                          });
                        }}
                        className="rounded border-slate-700 bg-slate-950 text-amber-500"
                      />
                      <span>Hide on Mobile</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Column Inspector */}
          {selectedType === 'column' && selectedColumn && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 block font-bold">
                  Editing Column
                </span>
                <span className="text-xs font-semibold text-slate-100">
                  Span: {selectedColumn.span} of 12
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium block">
                  Column Width (Grid Span: 1 to 12)
                </label>
                <div className="grid grid-cols-6 gap-1">
                  {[2, 3, 4, 6, 8, 12].map((span) => (
                    <button
                      key={span}
                      type="button"
                      onClick={() => onUpdateColumn(selectedColumn!.id, { span })}
                      className={`py-1.5 text-xs font-mono font-bold rounded ${
                        selectedColumn!.span === span
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {span}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Row Inspector */}
          {selectedType === 'row' && selectedRow && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 block font-bold">
                    Editing Row
                  </span>
                  <span className="text-xs font-semibold text-slate-100">
                    {selectedRow.columns.length} Columns
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteRow(selectedRow!.id)}
                  className="p-1 rounded bg-slate-800 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium block">Row Gap</label>
                <select
                  value={selectedRow.settings.gap || '2.5rem'}
                  onChange={(e) => {
                    onUpdateRow(selectedRow!.id, {
                      settings: { ...selectedRow!.settings, gap: e.target.value },
                    });
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
                >
                  <option value="1rem">Small (1rem)</option>
                  <option value="1.5rem">Medium (1.5rem)</option>
                  <option value="2.5rem">Large (2.5rem - Standard)</option>
                  <option value="3.5rem">Extra Large (3.5rem)</option>
                </select>
              </div>
            </div>
          )}

          {/* Root / Global Footer Settings */}
          {(selectedType === 'root' || !selectedId) && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 block font-bold">
                  Global Settings
                </span>
                <span className="text-xs font-semibold text-slate-100">
                  Global Footer Canvas
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Footer Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={layout.settings.background_color || '#0F172A'}
                      onChange={(e) => {
                        onUpdateRootSettings({ ...layout.settings, background_color: e.target.value });
                      }}
                      className="w-8 h-8 rounded bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={layout.settings.background_color || '#0F172A'}
                      onChange={(e) => {
                        onUpdateRootSettings({ ...layout.settings, background_color: e.target.value });
                      }}
                      className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Border Top Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={layout.settings.border_top_color || '#1E293B'}
                      onChange={(e) => {
                        onUpdateRootSettings({ ...layout.settings, border_top_color: e.target.value });
                      }}
                      className="w-8 h-8 rounded bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={layout.settings.border_top_color || '#1E293B'}
                      onChange={(e) => {
                        onUpdateRootSettings({ ...layout.settings, border_top_color: e.target.value });
                      }}
                      className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Container Max Width
                  </label>
                  <select
                    value={layout.settings.max_width || '7xl'}
                    onChange={(e) => {
                      onUpdateRootSettings({ ...layout.settings, max_width: e.target.value });
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
                  >
                    <option value="5xl">5xl (Compact Legal)</option>
                    <option value="6xl">6xl (Standard Institutional)</option>
                    <option value="7xl">7xl (Default Full Width)</option>
                    <option value="full">Full Screen (100% Edge-to-Edge)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
