import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
  startAnimation?: boolean;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  duration = 2000,
  suffix = '',
  decimals = 0,
  startAnimation = false
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<number>(0);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (startAnimation) {
      const startTime = Date.now();
      const startCount = 0;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = startCount + (end - startCount) * easeOutQuart;

        countRef.current = currentCount;
        setCount(currentCount);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [end, duration, startAnimation]);

  const formatNumber = (num: number) => {
    return decimals > 0 ? num.toFixed(decimals) : Math.floor(num).toString();
  };

  return <span>{formatNumber(count)}{suffix}</span>;
};

export default AnimatedCounter;
