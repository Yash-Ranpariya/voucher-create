import React, { useState } from 'react';
import { AuthProvider } from './app/providers/AuthProvider';
import { AppRouter } from './app/router';
import { ToastProvider } from './components/ui/Toast';
import { SplashScreen } from './components/layout/SplashScreen';
import { AnimatePresence, motion } from 'framer-motion';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !window.location.search.includes('nosplash');
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <AnimatePresence mode="wait">
            {showSplash ? (
              <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
            ) : (
              <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
                <AppRouter />
              </motion.div>
            )}
          </AnimatePresence>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
