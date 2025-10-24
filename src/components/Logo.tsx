'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export function Logo() {
  const router = useRouter();
  const pressTimerRef = useRef<NodeJS.Timeout>();

  const handlePressStart = () => {
    // Start timer: if held for 3 seconds, go to admin
    pressTimerRef.current = setTimeout(() => {
      console.log('🔓 Long press admin access!');
      router.push('/admin');
    }, 3000); // 3 seconds
  };

  const handlePressEnd = () => {
    // Cancel timer if released early
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
  };

  return (
    <div
      onMouseDown={handlePressStart}   // Desktop
      onMouseUp={handlePressEnd}       // Desktop
      onMouseLeave={handlePressEnd}    // Desktop (mouse leaves)
      onTouchStart={handlePressStart}  // Mobile
      onTouchEnd={handlePressEnd}      // Mobile
      onTouchCancel={handlePressEnd}   // Mobile (interrupted)
      className="cursor-pointer select-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <Image 
        src="/brand/flowdoors-logo.png" 
        alt="FlowDoors"
        width={200}
        height={60}
        draggable={false}
      />
    </div>
  );
}

