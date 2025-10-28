import React, { useEffect, useState, useRef } from "react";
import { Text } from "react-native";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  format?: (value: number) => string;
  className?: string;
  style?: any;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = React.memo(({
  value,
  duration = 1000,
  delay = 0,
  format = (val: number) => val.toFixed(0),
  className,
  style,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(value);
  const isMountedRef = useRef(true);

  // Safe format function with error handling
  const safeFormat = (val: number): string => {
    try {
      return format(val);
    } catch (error) {
      console.warn('AnimatedNumber format error:', error);
      return val.toString();
    }
  };

  // Easing function - cubic ease out
  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  useEffect(() => {
    // Clear any existing animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }

    // If duration is 0 or animation is disabled, update immediately
    if (duration <= 0) {
      setDisplayValue(value);
      startValueRef.current = value;
      return;
    }

    // Set up animation
    const startValue = startValueRef.current;
    const targetValue = value;
    const diff = targetValue - startValue;

    // If no significant change needed
    if (Math.abs(diff) < 0.01) {
      setDisplayValue(value);
      startValueRef.current = value;
      return;
    }

    const animate = () => {
      const startTime = Date.now();
      startTimeRef.current = startTime;

      const updateValue = () => {
        // Check if component is still mounted
        if (!isMountedRef.current) {
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        
        const currentValue = startValue + (diff * easedProgress);
        setDisplayValue(currentValue);

        if (progress < 1 && isMountedRef.current) {
          animationRef.current = setTimeout(updateValue, 16); // ~60fps
        } else {
          // Animation complete
          if (isMountedRef.current) {
            setDisplayValue(targetValue);
            startValueRef.current = targetValue;
          }
          animationRef.current = null;
        }
      };

      updateValue();
    };

    // Start animation after delay
    if (delay > 0) {
      animationRef.current = setTimeout(animate, delay);
    } else {
      animate();
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [value, duration, delay]);

  // Update start value when component mounts or value changes drastically
  useEffect(() => {
    startValueRef.current = displayValue;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  return (
    <Text className={className} style={style}>
      {safeFormat(displayValue)}
    </Text>
  );
});