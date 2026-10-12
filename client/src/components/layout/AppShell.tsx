import React, { useState } from 'react';
import { ParallaxBackground } from './ParallaxBackground';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '../../lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <ParallaxBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Topbar />
        
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
