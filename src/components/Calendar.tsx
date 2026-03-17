import React, { useState, useRef, useEffect } from 'react';
import { Block, PlannerSettings } from '../types';
import { BlockComponent } from './BlockComponent';
import { format, addDays, startOfWeek } from 'date-fns';

interface CalendarProps {
  settings: PlannerSettings;
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onCreateBlock: (block: Partial<Block>) => void;
  calendarRef: React.RefObject<HTMLDivElement>;
  isExporting?: boolean;
  onUpdateBlock: (block: Block) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  settings,
  blocks,
  selectedBlockId,
  onSelectBlock,
  onCreateBlock,
  calendarRef,
  isExporting = false,
  onUpdateBlock,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ day: number; hour: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ day: number; hour: number } | null>(null);

  const [dragState, setDragState] = useState<{
    type: 'move' | 'resize-top' | 'resize-bottom';
    blockId: string;
    initialBlock: Block;
    startX: number;
    startY: number;
  } | null>(null);
  const [previewBlock, setPreviewBlock] = useState<Block | null>(null);
  const previewBlockRef = useRef<Block | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dragState) {
      document.body.style.cursor = '';
      return;
    }

    document.body.style.cursor = dragState.type === 'move' ? 'grabbing' : 'ns-resize';

    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;

      const dayWidth = rect.width / 7;
      const hourHeight = rect.height / (settings.endHour - settings.startHour);

      const deltaDays = Math.round(deltaX / dayWidth);
      const deltaHours = Math.round(deltaY / hourHeight * 2) / 2; // Snap to 30 mins

      let newBlock = { ...dragState.initialBlock };

      if (dragState.type === 'move') {
        newBlock.dayOfWeek = Math.max(0, Math.min(6, newBlock.dayOfWeek + deltaDays));
        const duration = newBlock.endHour - newBlock.startHour;
        newBlock.startHour = Math.max(settings.startHour, Math.min(settings.endHour - duration, newBlock.startHour + deltaHours));
        newBlock.endHour = newBlock.startHour + duration;
      } else if (dragState.type === 'resize-top') {
        newBlock.startHour = Math.max(settings.startHour, Math.min(newBlock.endHour - 0.5, newBlock.startHour + deltaHours));
      } else if (dragState.type === 'resize-bottom') {
        newBlock.endHour = Math.max(newBlock.startHour + 0.5, Math.min(settings.endHour, newBlock.endHour + deltaHours));
      }

      setPreviewBlock(newBlock);
      previewBlockRef.current = newBlock;
    };

    const handleMouseUp = () => {
      if (previewBlockRef.current) {
        const changed = previewBlockRef.current.startHour !== dragState.initialBlock.startHour ||
                        previewBlockRef.current.endHour !== dragState.initialBlock.endHour ||
                        previewBlockRef.current.dayOfWeek !== dragState.initialBlock.dayOfWeek;
        if (changed) {
          onUpdateBlock(previewBlockRef.current);
        }
      }
      setDragState(null);
      setPreviewBlock(null);
      previewBlockRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [dragState, settings, onUpdateBlock]);

  const handleMoveStart = (id: string, e: React.MouseEvent) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      setDragState({ type: 'move', blockId: id, initialBlock: block, startX: e.clientX, startY: e.clientY });
    }
  };

  const handleResizeStart = (id: string, direction: 'top' | 'bottom', e: React.MouseEvent) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      setDragState({ type: `resize-${direction}`, blockId: id, initialBlock: block, startX: e.clientX, startY: e.clientY });
    }
  };

  const hours = Array.from({ length: settings.endHour - settings.startHour }, (_, i) => settings.startHour + i);
  const days = Array.from({ length: 7 }, (_, i) => i);

  const handleMouseDown = (e: React.MouseEvent, day: number, hour: number) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ day, hour });
    setDragCurrent({ day, hour });
    onSelectBlock(null);
  };

  const handleMouseEnter = (day: number, hour: number) => {
    if (isDragging) {
      setDragCurrent({ day, hour });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragCurrent) {
      const startHour = Math.min(dragStart.hour, dragCurrent.hour);
      const endHour = Math.max(dragStart.hour, dragCurrent.hour) + 0.5; // Each cell is 30 mins
      const dayOfWeek = dragStart.day;

      onCreateBlock({
        dayOfWeek,
        startHour,
        endHour,
        title: 'New Event',
        description: '',
        color: '#FFB7B2', // Default pastel pink
      });
    }
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, dragStart, dragCurrent]);

  const weekStart = new Date(settings.weekStartDate);

  return (
    <div className="flex-1 overflow-auto p-4 flex justify-center items-start">
      <div
        ref={calendarRef}
        className={`${isExporting ? '' : 'shadow-xl'} rounded-xl overflow-hidden flex flex-col`}
        style={{
          backgroundColor: isExporting ? 'transparent' : '#ffffff',
          width: '100%',
          maxWidth: '1000px',
          aspectRatio: '1 / 1.414', // A4 aspect ratio
          position: 'relative',
        }}
      >
        {/* Header */}
        <div className="flex border-b border-pink-100 bg-pink-50/50">
          <div className="w-16 border-r border-pink-100 flex-shrink-0"></div>
          {days.map((day) => {
            const date = addDays(weekStart, day);
            return (
              <div key={day} className="flex-1 text-center py-2 border-r border-pink-100 last:border-r-0">
                <div className="text-sm font-bold text-pink-800">{format(date, 'EEEE')}</div>
                <div className="text-xs text-pink-600">{format(date, 'MMM d')}</div>
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex flex-1 relative overflow-hidden">
          {/* Time Labels */}
          <div className="w-16 flex-shrink-0 border-r border-pink-100 bg-pink-50/20 relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute w-full text-right pr-2 text-xs text-pink-400 font-medium"
                style={{ 
                  top: `${((hour - settings.startHour) / (settings.endHour - settings.startHour)) * 100}%`, 
                  transform: hour === settings.startHour ? 'translateY(0)' : 'translateY(-50%)' 
                }}
              >
                {hour}:00
              </div>
            ))}
          </div>

          {/* Grid */}
          <div
            ref={gridRef}
            className="flex-1 relative"
            onMouseLeave={() => isDragging && handleMouseUp()}
          >
            {/* Alternating Backgrounds */}
            {settings.clearerGrids && hours.map((hour, index) => (
              <div
                key={`bg-${hour}`}
                className={`absolute w-full pointer-events-none ${index % 2 === 0 ? 'bg-blue-50/40' : 'bg-blue-100/40'}`}
                style={{ 
                  top: `${((hour - settings.startHour) / (settings.endHour - settings.startHour)) * 100}%`,
                  height: `${(1 / (settings.endHour - settings.startHour)) * 100}%`
                }}
              />
            ))}

            {/* Grid Lines */}
            {hours.map((hour) => (
              <div
                key={hour}
                className={`absolute w-full border-t pointer-events-none ${settings.clearerGrids ? 'border-blue-200' : 'border-pink-100/50'}`}
                style={{ top: `${((hour - settings.startHour) / (settings.endHour - settings.startHour)) * 100}%` }}
              />
            ))}
            {days.map((day) => (
              <div
                key={day}
                className={`absolute h-full border-l pointer-events-none ${settings.clearerGrids ? 'border-blue-200' : 'border-pink-100/50'}`}
                style={{ left: `${(day / 7) * 100}%` }}
              />
            ))}

            {/* Interaction Cells (30 min intervals) */}
            {days.map((day) =>
              Array.from({ length: (settings.endHour - settings.startHour) * 2 }).map((_, i) => {
                const hour = settings.startHour + i * 0.5;
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="absolute cursor-crosshair hover:bg-pink-100/30 transition-colors"
                    style={{
                      left: `${(day / 7) * 100}%`,
                      top: `${((hour - settings.startHour) / (settings.endHour - settings.startHour)) * 100}%`,
                      width: `${(1 / 7) * 100}%`,
                      height: `${(0.5 / (settings.endHour - settings.startHour)) * 100}%`,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, day, hour)}
                    onMouseEnter={() => handleMouseEnter(day, hour)}
                  />
                );
              })
            )}

            {/* Drag Selection Overlay */}
            {isDragging && dragStart && dragCurrent && (
              <div
                className="absolute bg-blue-400/30 border border-blue-400 rounded-md pointer-events-none z-20"
                style={{
                  left: `${(dragStart.day / 7) * 100}%`,
                  width: `${(1 / 7) * 100}%`,
                  top: `${((Math.min(dragStart.hour, dragCurrent.hour) - settings.startHour) / (settings.endHour - settings.startHour)) * 100}%`,
                  height: `${((Math.max(dragStart.hour, dragCurrent.hour) + 0.5 - Math.min(dragStart.hour, dragCurrent.hour)) / (settings.endHour - settings.startHour)) * 100}%`,
                }}
              />
            )}

            {/* Blocks */}
            {blocks.map((block) => {
              const displayBlock = previewBlock?.id === block.id ? previewBlock : block;
              return (
                <BlockComponent
                  key={block.id}
                  block={displayBlock}
                  settings={settings}
                  isSelected={selectedBlockId === block.id}
                  onSelect={onSelectBlock}
                  onMoveStart={!isExporting ? handleMoveStart : undefined}
                  onResizeStart={!isExporting ? handleResizeStart : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
