
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AccountCreation from "./pages/AccountCreation";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [hasAccount, setHasAccount] = useState(false);
  
  // Check if user has created an account (this would use localStorage or a real auth system)
  useEffect(() => {
    const savedAccount = localStorage.getItem('spotItAccount');
    if (savedAccount) {
      setHasAccount(true);
    }
  }, []);

  // Handle mobile viewport height issue (100vh problem on mobile browsers)
  useEffect(() => {
    const setViewHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set the initial viewport height
    setViewHeight();
    
    // Update on resize and orientation change
    window.addEventListener('resize', setViewHeight);
    window.addEventListener('orientationchange', setViewHeight);
    
    return () => {
      window.removeEventListener('resize', setViewHeight);
      window.removeEventListener('orientationchange', setViewHeight);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <div className="app-container" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
            <Routes>
              <Route path="/" element={hasAccount ? <Index /> : <AccountCreation />} />
              <Route path="/create-account" element={<AccountCreation />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
