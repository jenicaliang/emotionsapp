import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SplashScreen } from './components/SplashScreen';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <AnimatePresence>
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </AnimatePresence>
      
    );
  }

  return (
  <>
    <RouterProvider router={router} />
  </>
);
}
