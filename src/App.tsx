import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MilkLayout from "@/components/MilkLayout";
import Home from "./pages/Home";
import CalendarPage from "./pages/CalendarPage";
import EntryForm from "./pages/EntryForm";
import Payments from "./pages/Payments";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const shell = (node: React.ReactNode) => <MilkLayout>{node}</MilkLayout>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={shell(<Home />)} />
          <Route path="/calendar" element={shell(<CalendarPage />)} />
          <Route path="/add" element={shell(<EntryForm />)} />
          <Route path="/add/:date" element={shell(<EntryForm />)} />
          <Route path="/payments" element={shell(<Payments />)} />
          <Route path="/history" element={shell(<History />)} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
