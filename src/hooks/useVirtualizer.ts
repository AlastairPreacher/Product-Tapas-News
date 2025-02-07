import { useCallback, useEffect, useRef, useState } from 'react';

interface VirtualItem {
  index: number;
  start: number;
  size: number;
  end: number;
}

interface Options {
  count: number;
  getScrollElement: () => HTMLElement | null;
  estimateSize: (index: number) => number;
  overscan?: number;
}

export function useVirtualizer({
  count,
  getScrollElement,
  estimateSize,
  overscan = 1,
}: Options) {
  const [items, setItems] = useState<VirtualItem[]>([]);
  const sizeCache = useRef<number[]>([]);
  const measurementCache = useRef<Map<number, number>>(new Map());
  const lastCount = useRef(count);

  const getSize = useCallback(
    (index: number) => {
      return measurementCache.current.get(index) ?? estimateSize(index);
    },
    [estimateSize]
  );

  const calculateRange = useCallback(() => {
    const element = getScrollElement();
    if (!element) return;
    
    // Only recalculate if count has changed
    if (lastCount.current === count && items.length > 0) return;
    lastCount.current = count;

    const rect = element.getBoundingClientRect();
    const scrollTop = element.scrollTop;
    const viewportHeight = rect.height;

    let totalSize = 0;
    const newItems: VirtualItem[] = [];

    // Calculate total size and item positions
    for (let i = 0; i < count; i++) {
      const size = getSize(i);
      const start = totalSize;
      const end = start + size;
      totalSize += size;

      // Check if item is in view (with overscan)
      const isVisible =
        start < scrollTop + viewportHeight + overscan * viewportHeight &&
        end > scrollTop - overscan * viewportHeight;

      if (isVisible) {
        newItems.push({ index: i, start, size, end });
      }
    }

    setItems(newItems);
    sizeCache.current = Array(count).fill(0).map((_, i) => getSize(i));
  }, [count, getScrollElement, getSize, overscan, items.length]);

  useEffect(() => {
    const element = getScrollElement();
    if (!element) return;

    const observer = new ResizeObserver(() => {
      calculateRange();
    });

    observer.observe(element);
    element.addEventListener('scroll', calculateRange);
    calculateRange();

    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', calculateRange);
    };
  }, [calculateRange, getScrollElement]);

  const getTotalSize = useCallback(
    () => sizeCache.current.reduce((sum, size) => sum + size, 0),
    []
  );

  return {
    getVirtualItems: () => items,
    getTotalSize,
    measureElement: (element: HTMLElement | null, index: number) => {
      if (element) {
        const size = element.getBoundingClientRect().height;
        measurementCache.current.set(index, size);
        calculateRange();
      }
    },
  };
}