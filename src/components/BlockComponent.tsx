import React, { useRef, useEffect, useState } from 'react';
import { Block, PlannerSettings } from '../types';

interface BlockProps {
  block: Block;
  settings: PlannerSettings;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMoveStart?: (id: string, e: React.MouseEvent) => void;
  onResizeStart?: (id: string, direction: 'top' | 'bottom', e: React.MouseEvent) => void;
}

export const BlockComponent: React.FC<BlockProps> = ({ 
  block, 
  settings, 
  isSelected, 
  onSelect,
  onMoveStart,
  onResizeStart
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!contentRef.current || !containerRef.current) return;
    
    let titleSize = 20;
    let descSize = 14;
    const content = contentRef.current;
    const container = containerRef.current;
    
    const titleEl = content.querySelector('h3') as HTMLHeadingElement;
    const descEl = content.querySelector('p') as HTMLParagraphElement;
    
    if (!titleEl || !descEl) return;

    if (block.fontSize) {
      titleEl.style.fontSize = `${block.fontSize}px`;
      descEl.style.fontSize = `${Math.max(8, block.fontSize * 0.7)}px`;
      return;
    }

    // Reset
    titleEl.style.fontSize = `${titleSize}px`;
    descEl.style.fontSize = `${descSize}px`;

    while (content.scrollHeight > container.clientHeight && titleSize > 8) {
      titleSize -= 1;
      descSize = Math.max(8, titleSize * 0.7);
      titleEl.style.fontSize = `${titleSize}px`;
      descEl.style.fontSize = `${descSize}px`;
    }
  }, [block.title, block.description, dimensions.width, dimensions.height, block.fontSize]);

  const totalHours = settings.endHour - settings.startHour;
  const top = ((block.startHour - settings.startHour) / totalHours) * 100;
  const height = ((block.endHour - block.startHour) / totalHours) * 100;
  const left = (block.dayOfWeek / 7) * 100;
  const width = (1 / 7) * 100;

  return (
    <div
      ref={containerRef}
      className={`absolute border border-white/20 rounded-md overflow-hidden cursor-pointer transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg z-10' : 'hover:shadow-md z-0'
      }`}
      style={{
        top: `${top}%`,
        height: `${height}%`,
        left: `${left}%`,
        width: `${width}%`,
        backgroundColor: block.color,
        cursor: onMoveStart ? 'grab' : 'pointer',
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect(block.id);
        onMoveStart?.(block.id, e);
      }}
    >
      {/* Top Handle */}
      {onResizeStart && (
        <div 
          className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-20 hover:bg-white/40"
          onMouseDown={(e) => {
            e.stopPropagation();
            onSelect(block.id);
            onResizeStart(block.id, 'top', e);
          }}
        />
      )}
      
      {/* Bottom Handle */}
      {onResizeStart && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-20 hover:bg-white/40"
          onMouseDown={(e) => {
            e.stopPropagation();
            onSelect(block.id);
            onResizeStart(block.id, 'bottom', e);
          }}
        />
      )}

      <div ref={contentRef} className="p-1 w-full h-full flex flex-col items-start justify-start overflow-hidden break-words text-gray-800 pointer-events-none" style={{ fontFamily: block.fontFamily || 'inherit' }}>
        <h3 className="font-bold leading-tight m-0 w-full">{block.title}</h3>
        <p className="leading-tight m-0 opacity-80 w-full whitespace-pre-wrap">{block.description}</p>
      </div>
    </div>
  );
};
