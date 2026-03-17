import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { Sidebar } from './components/Sidebar';
import { AppState, Block, PlannerSettings } from './types';
import { startOfWeek } from 'date-fns';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

const generateId = () => Math.random().toString(36).substr(2, 9);

const DEFAULT_SETTINGS: PlannerSettings = {
  startHour: 6,
  endHour: 24,
  weekStartDate: startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(),
  clearerGrids: false,
};

const loadInitialState = (): { settings: PlannerSettings; blocks: Block[] } => {
  try {
    const saved = localStorage.getItem('planner-data-autosave');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
        blocks: parsed.blocks || []
      };
    }
  } catch (e) {
    console.error('Failed to load saved data', e);
  }
  return { settings: DEFAULT_SETTINGS, blocks: [] };
};

const initialState = loadInitialState();

export default function App() {
  const [settings, setSettings] = useState<PlannerSettings>(initialState.settings);
  const [historyState, setHistoryState] = useState({
    past: [] as Block[][],
    present: initialState.blocks,
    future: [] as Block[][]
  });

  const blocks = historyState.present;
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [copiedBlock, setCopiedBlock] = useState<Block | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);

  // Auto-saving mechanism
  useEffect(() => {
    const dataToSave: AppState = { settings, blocks: historyState.present };
    localStorage.setItem('planner-data-autosave', JSON.stringify(dataToSave));
  }, [settings, historyState.present]);

  const updateBlocks = useCallback((action: Block[] | ((prev: Block[]) => Block[])) => {
    setHistoryState((prev) => {
      const nextBlocks = typeof action === 'function' ? action(prev.present) : action;
      return {
        past: [...prev.past, prev.present],
        present: nextBlocks,
        future: []
      };
    });
  }, []);

  const handleUndo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future]
      };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  const handleCreateBlock = (partialBlock: Partial<Block>) => {
    const newBlock: Block = {
      id: generateId(),
      dayOfWeek: partialBlock.dayOfWeek ?? 0,
      startHour: partialBlock.startHour ?? 6,
      endHour: partialBlock.endHour ?? 7,
      title: partialBlock.title ?? 'New Event',
      description: partialBlock.description ?? '',
      color: partialBlock.color ?? '#FFB7B2',
      fontFamily: partialBlock.fontFamily,
      fontSize: partialBlock.fontSize,
    };
    updateBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const handleUpdateBlock = (updatedBlock: Block) => {
    updateBlocks((prev) => prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)));
  };

  const handleDeleteBlock = (id: string) => {
    updateBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const handlePasteBlock = useCallback(() => {
    if (copiedBlock) {
      let newStartHour = copiedBlock.startHour + 0.5;
      let newEndHour = copiedBlock.endHour + 0.5;
      let newDayOfWeek = copiedBlock.dayOfWeek;

      if (newEndHour > settings.endHour) {
        const duration = copiedBlock.endHour - copiedBlock.startHour;
        newStartHour = settings.startHour;
        newEndHour = settings.startHour + duration;
        newDayOfWeek = Math.min(6, newDayOfWeek + 1);
      }

      const newBlock = { 
        ...copiedBlock, 
        id: generateId(),
        startHour: newStartHour,
        endHour: newEndHour,
        dayOfWeek: newDayOfWeek
      };
      updateBlocks((prev) => [...prev, newBlock]);
      setSelectedBlockId(newBlock.id);
    }
  }, [copiedBlock, updateBlocks, settings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || activeEl?.tagName === 'SELECT';
      if (isTyping) return;

      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        const code = e.code;
        
        if (key === 'z' || code === 'KeyZ') {
          e.preventDefault();
          if (e.shiftKey) handleRedo();
          else handleUndo();
          return;
        }
        if (key === 'y' || code === 'KeyY') {
          e.preventDefault();
          handleRedo();
          return;
        }
        if ((key === 'c' || code === 'KeyC') && selectedBlockId) {
          e.preventDefault();
          const block = blocks.find(b => b.id === selectedBlockId);
          if (block) setCopiedBlock(block);
          return;
        }
        if ((key === 'v' || code === 'KeyV') && copiedBlock) {
          e.preventDefault();
          handlePasteBlock();
          return;
        }
      }

      if (!selectedBlockId) return;

      const block = blocks.find(b => b.id === selectedBlockId);
      if (!block) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteBlock(selectedBlockId);
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        let { startHour, endHour, dayOfWeek } = block;
        const duration = endHour - startHour;

        if (e.key === 'ArrowUp') {
          startHour = Math.max(settings.startHour, startHour - 0.5);
          endHour = startHour + duration;
        } else if (e.key === 'ArrowDown') {
          endHour = Math.min(settings.endHour, endHour + 0.5);
          startHour = endHour - duration;
        } else if (e.key === 'ArrowLeft') {
          dayOfWeek = Math.max(0, dayOfWeek - 1);
        } else if (e.key === 'ArrowRight') {
          dayOfWeek = Math.min(6, dayOfWeek + 1);
        }

        handleUpdateBlock({ ...block, startHour, endHour, dayOfWeek });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, blocks, settings, copiedBlock, handleUndo, handleRedo, handlePasteBlock]);

  const handleExportPNG = () => {
    if (!calendarRef.current) return;
    
    setIsExporting(true);
    const prevSelected = selectedBlockId;
    setSelectedBlockId(null);
    
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(calendarRef.current!, {
          backgroundColor: null, // Transparent
          scale: 2, // High resolution
          useCORS: true,
        });

        const link = document.createElement('a');
        link.download = 'weekly-planner.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Export PNG failed:', error);
        alert('Failed to export PNG. Please try again.');
      } finally {
        setSelectedBlockId(prevSelected);
        setIsExporting(false);
      }
    }, 150);
  };

  const handleExportPDF = () => {
    if (!calendarRef.current) return;
    
    setIsExporting(true);
    const prevSelected = selectedBlockId;
    setSelectedBlockId(null);
    
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(calendarRef.current!, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('weekly-planner.pdf');
      } catch (error) {
        console.error('Export PDF failed:', error);
        alert('Failed to export PDF. Please try again.');
      } finally {
        setSelectedBlockId(prevSelected);
        setIsExporting(false);
      }
    }, 150);
  };

  const handleExportJSON = () => {
    const data: AppState = { settings, blocks };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'planner-data.json';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as AppState;
        if (data.settings && data.blocks) {
          setSettings(data.settings);
          setHistoryState({
            past: [],
            present: data.blocks,
            future: []
          });
          setSelectedBlockId(null);
        } else {
          alert('Invalid file format');
        }
      } catch (error) {
        alert('Error parsing JSON file');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div 
      className="flex h-screen w-full font-sans text-gray-800 overflow-hidden"
      style={{
        backgroundColor: '#fdf2f8',
        backgroundImage: 'radial-gradient(#fbcfe8 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      <Calendar
        settings={settings}
        blocks={blocks}
        selectedBlockId={selectedBlockId}
        onSelectBlock={setSelectedBlockId}
        onCreateBlock={handleCreateBlock}
        calendarRef={calendarRef}
        isExporting={isExporting}
        onUpdateBlock={handleUpdateBlock}
      />
      <Sidebar
        settings={settings}
        onUpdateSettings={setSettings}
        selectedBlock={blocks.find((b) => b.id === selectedBlockId) || null}
        onUpdateBlock={handleUpdateBlock}
        onDeleteBlock={handleDeleteBlock}
        onCopyBlock={setCopiedBlock}
        copiedBlock={copiedBlock}
        onPasteBlock={handlePasteBlock}
        onExportPDF={handleExportPDF}
        onExportPNG={handleExportPNG}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
      />
    </div>
  );
}
