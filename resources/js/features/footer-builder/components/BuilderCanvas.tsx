import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Move, LayoutGrid } from 'lucide-react';
import { ElementRenderer } from './ElementRenderer';
import type { FooterLayoutData } from '../types';

interface BuilderCanvasProps {
  layout: FooterLayoutData;
  viewport: 'desktop' | 'tablet' | 'mobile';
  locale: 'en' | 'bn';
  selectedId: string | null;
  selectedType: 'element' | 'column' | 'row' | 'root' | null;
  onSelect: (id: string | null, type: 'element' | 'column' | 'row' | 'root' | null) => void;
  onAddRow: () => void;
  onAddColumn: (rowId: string) => void;
  onAddElement: (columnId: string) => void;
  onDeleteRow: (rowId: string) => void;
  onDeleteColumn: (rowId: string, columnId: string) => void;
  onDeleteElement: (elementId: string) => void;
  onMoveElement: (elementId: string, direction: 'up' | 'down') => void;
  onReorderElements: (sourceId: string, targetColId: string, targetIndex: number) => void;
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  layout,
  viewport,
  locale,
  selectedId,
  selectedType,
  onSelect,
  onAddRow,
  onAddColumn,
  onAddElement,
  onDeleteRow,
  onDeleteColumn,
  onDeleteElement,
  onMoveElement,
  onReorderElements,
}) => {
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);

  // Viewport container width constraints
  const getViewportClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-[375px] max-w-full';
      case 'tablet':
        return 'w-[768px] max-w-full';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  const getContainerMaxWidth = () => {
    switch (layout.settings.max_width) {
      case '5xl':
        return 'max-w-5xl';
      case '6xl':
        return 'max-w-6xl';
      case 'full':
        return 'max-w-full';
      case '7xl':
      default:
        return 'max-w-7xl';
    }
  };

  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    e.stopPropagation();
    setDraggedElementId(elementId);
    e.dataTransfer.setData('text/plain', elementId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColId: string, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedElementId;
    if (sourceId) {
      onReorderElements(sourceId, targetColId, targetIndex);
    }
    setDraggedElementId(null);
  };

  return (
    <div
      onClick={() => onSelect(null, 'root')}
      className="flex-1 h-full overflow-y-auto bg-slate-950 p-6 flex flex-col items-center justify-start select-none scrollbar-thin scrollbar-thumb-slate-800"
    >
      {/* Device Frame Wrapper */}
      <div
        className={`transition-all duration-300 shadow-2xl rounded-xl border border-slate-800/80 overflow-hidden bg-slate-900 ${getViewportClass()}`}
      >
        {/* Device Header Bar */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            </div>
            <span className="font-mono text-[11px] text-slate-500 uppercase ml-2">
              {viewport} Mode • {locale.toUpperCase()}
            </span>
          </div>
          <span className="text-[10px] text-amber-400/80 font-mono">
            Elementor Canvas v2.6
          </span>
        </div>

        {/* Live Footer Canvas */}
        <footer
          style={{
            backgroundColor: layout.settings.background_color || '#0F172A',
            borderTopColor: layout.settings.border_top_color || '#1E293B',
          }}
          className="border-t pt-16 pb-12 text-slate-400 text-sm transition-colors relative min-h-[350px]"
        >
          <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${getContainerMaxWidth()}`}>
            {layout.rows.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-xl">
                <LayoutGrid className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No footer rows configured.</p>
                <button
                  type="button"
                  onClick={onAddRow}
                  className="mt-3 px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-semibold rounded-md hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Create First Row
                </button>
              </div>
            ) : (
              layout.rows.map((row, rIdx) => {
                const isRowSelected = selectedType === 'row' && selectedId === row.id;

                return (
                  <div
                    key={row.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(row.id, 'row');
                    }}
                    style={{
                      marginBottom: row.settings.margin_bottom || '2rem',
                    }}
                    className={`relative group/row rounded-lg transition-all ${
                      isRowSelected
                        ? 'ring-2 ring-blue-500/80 bg-blue-500/5'
                        : 'hover:ring-1 hover:ring-slate-700'
                    }`}
                  >
                    {/* Row Controls Floating Header */}
                    <div className="absolute -top-3 left-4 hidden group-hover/row:flex items-center gap-1 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] text-slate-300 z-30 shadow-md">
                      <span className="font-mono text-amber-400 font-bold">ROW #{rIdx + 1}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddColumn(row.id);
                        }}
                        className="hover:text-amber-300 ml-1 flex items-center gap-0.5 text-slate-300"
                        title="Add Column to Row"
                      >
                        <Plus className="w-2.5 h-2.5" /> Col
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRow(row.id);
                        }}
                        className="hover:text-red-400 ml-1"
                        title="Delete Row"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {/* Columns Grid */}
                    <div
                      style={{ gap: row.settings.gap || '2rem' }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12"
                    >
                      {row.columns.map((column, cIdx) => {
                        const isColSelected = selectedType === 'column' && selectedId === column.id;
                        // Determine grid column span
                        const spanClass = `lg:col-span-${column.span || 12}`;

                        return (
                          <div
                            key={column.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(column.id, 'column');
                            }}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id, column.elements.length)}
                            style={{
                              backgroundColor: column.settings.background_color || undefined,
                            }}
                            className={`${spanClass} relative group/col p-2 rounded-md transition-all ${
                              isColSelected
                                ? 'ring-2 ring-amber-500/70 bg-amber-500/5'
                                : 'hover:ring-1 hover:ring-slate-700/80'
                            }`}
                          >
                            {/* Column Info Badge */}
                            <div className="absolute -top-2.5 right-2 hidden group-hover/col:flex items-center gap-1 bg-slate-800 border border-slate-700 px-1.5 py-0.2 rounded text-[9px] font-mono text-slate-400 z-20">
                              <span>Col {cIdx + 1} (span {column.span})</span>
                              {row.columns.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteColumn(row.id, column.id);
                                  }}
                                  className="text-red-400 hover:text-red-300 ml-1"
                                >
                                  ×
                                </button>
                              )}
                            </div>

                            {/* Elements List */}
                            <div className="space-y-3">
                              {column.elements.length === 0 ? (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddElement(column.id);
                                  }}
                                  className="py-6 border border-dashed border-slate-800 rounded-md text-center hover:border-amber-500/50 hover:bg-slate-800/20 cursor-pointer transition-all"
                                >
                                  <Plus className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                                  <span className="text-[10px] text-slate-500">
                                    Click to Add Element
                                  </span>
                                </div>
                              ) : (
                                column.elements.map((el, eIdx) => {
                                  const isElSelected = selectedType === 'element' && selectedId === el.id;

                                  return (
                                    <div
                                      key={el.id}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, el.id)}
                                      onDragOver={handleDragOver}
                                      onDrop={(e) => handleDrop(e, column.id, eIdx)}
                                      className="relative group/el"
                                    >
                                      {/* Element quick action hover bar */}
                                      {isElSelected && (
                                        <div className="absolute -top-3.5 left-2 flex items-center gap-1 bg-slate-900 border border-amber-500 px-1.5 py-0.5 rounded text-[9px] text-slate-300 z-30 shadow-md">
                                          <Move className="w-2.5 h-2.5 text-amber-400 cursor-grab" />
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onMoveElement(el.id, 'up');
                                            }}
                                            className="hover:text-amber-400"
                                            title="Move Up"
                                          >
                                            <ArrowUp className="w-2.5 h-2.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onMoveElement(el.id, 'down');
                                            }}
                                            className="hover:text-amber-400"
                                            title="Move Down"
                                          >
                                            <ArrowDown className="w-2.5 h-2.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onDeleteElement(el.id);
                                            }}
                                            className="hover:text-red-400 ml-0.5"
                                            title="Delete"
                                          >
                                            <Trash2 className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                      )}

                                      <ElementRenderer
                                        element={el}
                                        locale={locale}
                                        isBuilderMode={true}
                                        isSelected={isElSelected}
                                        onSelect={() => onSelect(el.id, 'element')}
                                      />
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Column Add Element Button */}
                            {column.elements.length > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddElement(column.id);
                                }}
                                className="w-full mt-2 py-1 border border-dashed border-slate-800 hover:border-amber-500/40 rounded text-[10px] text-slate-500 hover:text-amber-400 flex items-center justify-center gap-1 opacity-0 group-hover/col:opacity-100 transition-all cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" /> Add Element
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}

            {/* Bottom Add Row Trigger */}
            <div className="pt-6 flex justify-center">
              <button
                type="button"
                onClick={onAddRow}
                className="px-4 py-2 rounded-lg border border-dashed border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/10 text-amber-400 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Row</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
