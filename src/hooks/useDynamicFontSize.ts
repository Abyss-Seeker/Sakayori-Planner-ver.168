import { useEffect, useRef } from 'react';

export function useDynamicFontSize(title: string, description: string, width: number, height: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!containerRef.current || !titleRef.current || !descRef.current) return;

    let titleSize = 24; // Max title font size
    let descSize = 16;  // Max desc font size
    
    const container = containerRef.current;
    
    // Reset to max
    titleRef.current.style.fontSize = `${titleSize}px`;
    descRef.current.style.fontSize = `${descSize}px`;

    // Loop until it fits or hits minimum size
    while (container.scrollHeight > container.clientHeight && titleSize > 8) {
      titleSize -= 1;
      descSize = Math.max(8, titleSize * 0.6);
      titleRef.current.style.fontSize = `${titleSize}px`;
      descRef.current.style.fontSize = `${descSize}px`;
    }
  }, [title, description, width, height]);

  return { containerRef, titleRef, descRef };
}
