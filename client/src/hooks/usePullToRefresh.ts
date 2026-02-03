import { useState, useRef, useCallback, RefObject } from "react";

interface UsePullToRefreshProps {
  onRefresh: () => Promise<void>;
  containerRef?: RefObject<HTMLElement>;
  threshold?: number;
  disabled?: boolean;
}

interface UsePullToRefreshResult {
  pullDistance: number;
  isPulling: boolean;
  isRefreshing: boolean;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

export function usePullToRefresh({
  onRefresh,
  containerRef,
  threshold = 80,
  disabled = false,
}: UsePullToRefreshProps): UsePullToRefreshResult {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const touchActive = useRef(false);
  const pullStartY = useRef<number | null>(null);
  const lastY = useRef(0);

  const getScrollTop = useCallback(() => {
    if (containerRef?.current) {
      return containerRef.current.scrollTop;
    }
    return window.scrollY || document.documentElement.scrollTop || 0;
  }, [containerRef]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    touchActive.current = true;
    lastY.current = e.touches[0].clientY;
    pullStartY.current = null;
    setPullDistance(0);
    setIsPulling(false);
  }, [disabled, isRefreshing]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchActive.current || disabled || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const scrollTop = getScrollTop();
    const movingDown = currentY > lastY.current;
    
    lastY.current = currentY;
    
    if (scrollTop <= 1 && movingDown && pullStartY.current === null) {
      pullStartY.current = currentY;
      setIsPulling(true);
    }
    
    if (pullStartY.current === null) {
      return;
    }
    
    const rawDistance = currentY - pullStartY.current;
    
    if (rawDistance <= 0) {
      setPullDistance(0);
      return;
    }
    
    const resistance = 0.5;
    const dampedDistance = rawDistance * resistance;
    const maxPull = threshold * 1.5;
    const clampedDistance = Math.min(dampedDistance, maxPull);
    
    setPullDistance(clampedDistance);
    
    if (clampedDistance > 10) {
      e.preventDefault();
    }
  }, [disabled, isRefreshing, threshold, getScrollTop]);

  const onTouchEnd = useCallback(async () => {
    if (!touchActive.current) return;
    
    touchActive.current = false;
    setIsPulling(false);
    
    if (pullStartY.current === null || disabled) {
      setPullDistance(0);
      pullStartY.current = null;
      return;
    }
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold * 0.5);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    
    pullStartY.current = null;
  }, [pullDistance, threshold, onRefresh, isRefreshing, disabled]);

  return {
    pullDistance,
    isPulling,
    isRefreshing,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
