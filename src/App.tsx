import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppShell from "@/components/AppShell";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Studio from "./pages/Studio";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Clips from "./pages/Clips";
import ClipDetail from "./pages/ClipDetail";
import Editor from "./pages/Editor";
import Templates from "./pages/Templates";
import Pricing from "./pages/Pricing";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const shell = (node: React.ReactNode) => <AppShell>{node}</AppShell>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/studio" element={shell(<Studio />)} />
          <Route path="/projects" element={shell(<Projects />)} />
          <Route path="/projects/:id" element={shell(<ProjectDetail />)} />
          <Route path="/clips" element={shell(<Clips />)} />
          <Route path="/clips/:id" element={shell(<ClipDetail />)} />
          <Route path="/editor" element={shell(<Editor />)} />
          <Route path="/editor/:clipId" element={shell(<Editor />)} />
          <Route path="/templates" element={shell(<Templates />)} />
          <Route path="/pricing" element={shell(<Pricing />)} />
          <Route path="/settings" element={shell(<SettingsPage />)} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
