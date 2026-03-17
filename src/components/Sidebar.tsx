import React from 'react';
import { Block, PlannerSettings } from '../types';
import { DEFAULT_COLORS, DAYS_OF_WEEK } from '../constants';
import { format, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Copy, Trash2, Download, FileJson, Upload } from 'lucide-react';

interface SidebarProps {
  settings: PlannerSettings;
  onUpdateSettings: (settings: PlannerSettings) => void;
  selectedBlock: Block | null;
  onUpdateBlock: (block: Block) => void;
  onDeleteBlock: (id: string) => void;
  onCopyBlock: (block: Block) => void;
  copiedBlock: Block | null;
  onPasteBlock: () => void;
  onExportPDF: () => void;
  onExportPNG: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  onUpdateSettings,
  selectedBlock,
  onUpdateBlock,
  onDeleteBlock,
  onCopyBlock,
  copiedBlock,
  onPasteBlock,
  onExportPDF,
  onExportPNG,
  onExportJSON,
  onImportJSON,
}) => {
  const handlePrevWeek = () => {
    onUpdateSettings({
      ...settings,
      weekStartDate: subWeeks(new Date(settings.weekStartDate), 1).toISOString(),
    });
  };

  const handleNextWeek = () => {
    onUpdateSettings({
      ...settings,
      weekStartDate: addWeeks(new Date(settings.weekStartDate), 1).toISOString(),
    });
  };

  return (
    <div className="w-80 bg-white border-l border-pink-100 p-6 flex flex-col h-full overflow-y-auto shadow-[-4px_0_15px_rgba(0,0,0,0.05)]">
      <h1 className="text-2xl font-bold text-pink-500 mb-6 text-center tracking-wide">
        ✨ Weekly Planner ✨
      </h1>

      {/* Week Navigation */}
      <div className="mb-6 flex items-center justify-between bg-pink-50 rounded-full p-2">
        <button onClick={handlePrevWeek} className="p-2 hover:bg-pink-200 rounded-full transition-colors text-pink-600">
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold text-pink-800 text-sm">
          {format(new Date(settings.weekStartDate), 'MMM d, yyyy')}
        </span>
        <button onClick={handleNextWeek} className="p-2 hover:bg-pink-200 rounded-full transition-colors text-pink-600">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Time Range Settings */}
      <div className="mb-8 p-4 bg-pink-50/50 rounded-xl border border-pink-100">
        <h3 className="text-sm font-bold text-pink-700 mb-3">Time Range</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs text-pink-500 mb-1">Start Hour</label>
            <input
              type="number"
              min={0}
              max={23}
              value={settings.startHour}
              onChange={(e) => onUpdateSettings({ ...settings, startHour: parseInt(e.target.value) || 0 })}
              className="w-full p-2 rounded-lg border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-pink-500 mb-1">End Hour</label>
            <input
              type="number"
              min={1}
              max={24}
              value={settings.endHour}
              onChange={(e) => onUpdateSettings({ ...settings, endHour: parseInt(e.target.value) || 24 })}
              className="w-full p-2 rounded-lg border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none text-sm"
            />
          </div>
        </div>

        {/* Grid Settings */}
        <div className="mt-4 flex items-center justify-between">
          <label className="text-sm font-bold text-pink-700">Clearer Grids</label>
          <button
            onClick={() => onUpdateSettings({ ...settings, clearerGrids: !settings.clearerGrids })}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.clearerGrids ? 'bg-pink-500' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.clearerGrids ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Block Editor */}
      {selectedBlock ? (
        <div className="mb-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-right-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-blue-700">Edit Block</h3>
            <div className="flex gap-2">
              <button
                onClick={() => onCopyBlock(selectedBlock)}
                className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors"
                title="Copy"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={() => onDeleteBlock(selectedBlock.id)}
                className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-blue-600 mb-1">Title</label>
              <input
                type="text"
                value={selectedBlock.title}
                onChange={(e) => onUpdateBlock({ ...selectedBlock, title: e.target.value })}
                className="w-full p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                placeholder="Event Title"
              />
            </div>

            <div>
              <label className="block text-xs text-blue-600 mb-1">Description</label>
              <textarea
                value={selectedBlock.description}
                onChange={(e) => onUpdateBlock({ ...selectedBlock, description: e.target.value })}
                className="w-full p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none text-sm min-h-[80px] resize-none"
                placeholder="Details..."
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-blue-600 mb-1">Day</label>
                <select
                  value={selectedBlock.dayOfWeek}
                  onChange={(e) => onUpdateBlock({ ...selectedBlock, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                >
                  {DAYS_OF_WEEK.map((day, idx) => (
                    <option key={idx} value={idx}>{day}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-blue-600 mb-1">Start</label>
                <input
                  type="number"
                  step="0.5"
                  value={selectedBlock.startHour}
                  onChange={(e) => onUpdateBlock({ ...selectedBlock, startHour: parseFloat(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-blue-600 mb-1">End</label>
                <input
                  type="number"
                  step="0.5"
                  value={selectedBlock.endHour}
                  onChange={(e) => onUpdateBlock({ ...selectedBlock, endHour: parseFloat(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-blue-600 mb-1">Font Family</label>
                <select
                  value={selectedBlock.fontFamily || ''}
                  onChange={(e) => onUpdateBlock({ ...selectedBlock, fontFamily: e.target.value })}
                  className="w-full p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                >
                  <option value="">Default</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Comic Sans MS', cursive, sans-serif">Comic Sans</option>
                  <option value="'Courier New', Courier, monospace">Courier New</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', Times, serif">Times New Roman</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                </select>
              </div>
              <div className="w-20">
                <label className="block text-xs text-blue-600 mb-1">Size (px)</label>
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={selectedBlock.fontSize || ''}
                  onChange={(e) => onUpdateBlock({ ...selectedBlock, fontSize: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                  placeholder="Auto"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-blue-600 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdateBlock({ ...selectedBlock, color })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      selectedBlock.color === color ? 'border-gray-600 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={selectedBlock.color}
                  onChange={(e) => onUpdateBlock({ ...selectedBlock, color: e.target.value })}
                  className="w-6 h-6 rounded-full overflow-hidden cursor-pointer border-0 p-0"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-8 border-2 border-dashed border-pink-200 rounded-xl text-center text-pink-400 text-sm">
          Select a block on the calendar to edit it.
        </div>
      )}

      {/* Paste Button */}
      {copiedBlock && (
        <button
          onClick={onPasteBlock}
          className="mb-8 w-full py-2 px-4 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
        >
          <Copy size={16} /> Paste Block ({copiedBlock.title})
        </button>
      )}

      <div className="mt-auto space-y-3">
        <h3 className="text-sm font-bold text-gray-700 mb-2 border-b pb-2">Export & Import</h3>
        
        <button onClick={onExportPDF} className="w-full py-2.5 px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm shadow-pink-200">
          <Download size={18} /> Export PDF (A4)
        </button>
        
        <button onClick={onExportPNG} className="w-full py-2.5 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm shadow-purple-200">
          <Download size={18} /> Export PNG (Transparent)
        </button>
        
        <div className="flex gap-2">
          <button onClick={onExportJSON} className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
            <FileJson size={16} /> Export Data
          </button>
          
          <label className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium cursor-pointer">
            <Upload size={16} /> Import
            <input type="file" accept=".json" onChange={onImportJSON} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
