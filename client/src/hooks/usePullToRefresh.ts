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
  const startY = useRef(0);
  const canPull = useRef(false);

  const isAtTop = useCallback(() => {
    if (containerRef?.current) {
      return containerRef.current.scrollTop <= 5;
    }
    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
    return scrollTop <= 5;
  }, [containerRef]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    if (!isAtTop()) {
      canPull.current = false;
      return;
    }
    
    canPull.current = true;
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [disabled, isRefreshing, isAtTop]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || !canPull.current || disabled || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    
    if (distance <= 0) {
      setPullDistance(0);
      return;
    }
    
    const dampedDistance = Math.min(distance * 0.5, threshold * 1.5);
    setPullDistance(dampedDistance);
    
    if (dampedDistance > 10) {
      e.preventDefault();
    }
  }, [isPulling, disabled, isRefreshing, threshold]);

  const onTouchEnd = useCallback(async () => {
    if (!isPulling || !canPull.current || disabled) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }
    
    setIsPulling(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold * 0.6);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    
    canPull.current = false;
  }, [isPulling, pullDistance, threshold, onRefresh, isRefreshing, disabled]);

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
