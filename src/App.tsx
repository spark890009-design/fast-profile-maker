import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InstallAppButton } from "@/components/InstallAppButton";
import Index from "./pages/Index";
import Auth from "./pages/Auth";

import Dashboard from "./pages/Dashboard";
import Withdraw from "./pages/Withdraw";
import Admin from "./pages/Admin";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Transactions from "./pages/Transactions";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import { installSoundUnlock } from "@/lib/sound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => installSoundUnlock(), []);

  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/support" element={<Support />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <InstallAppButton />
      </BrowserRouter>

    </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
