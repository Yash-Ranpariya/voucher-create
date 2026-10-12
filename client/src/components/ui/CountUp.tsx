import React, { useEffect, useState } from 'react';

export const CountUp = ({ end, duration = 2000, prefix = '' }: { end: number, duration?: number, prefix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      setCount(end * easeOut);

      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{prefix}{Number.isInteger(end) ? Math.round(count) : count.toFixed(2)}</span>;
};
