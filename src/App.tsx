
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AccountCreation from "./pages/AccountCreation";
import Login from "./pages/Login";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Current session:", data.session);
        const isAuthenticated = !!data.session;
        setIsLoggedIn(isAuthenticated);
        
        if (isAuthenticated) {
          toast({
            title: "Authenticated",
            description: `Logged in as ${data.session.user.email}`,
          });
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setIsLoggedIn(!!session);
      
      if (event === 'SIGNED_IN') {
        toast({
          title: "Signed in",
          description: `Successfully signed in as ${session?.user?.email}`,
        });
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You have been signed out",
        });
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
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

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-spot-blue to-spot-purple mb-4"></div>
          <p className="text-sm font-medium">Loading Spot It...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <div className="app-container" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
            <Routes>
              <Route path="/" element={isLoggedIn ? <Index /> : <Navigate to="/login" />} />
              <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />
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
