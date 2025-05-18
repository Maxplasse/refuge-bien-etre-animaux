import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AnimalDetailPage from "./pages/AnimalDetailPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AnimalDashboard from "@/components/AnimalDashboard";
import AddAnimal from "./pages/AddAnimal";
import AppLayout from "./components/AppLayout";
// @ts-ignore
import AdminPortal from "./pages/AdminPortal";

const queryClient = new QueryClient();

function NotificationWatcher() {
  const { user } = useAuth();
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Function to check for new observations
    const checkForNewObservations = async () => {
      try {
        // First, get the last time we checked
        if (!lastCheckTime) {
          // If this is our first check, just save the current time
          setLastCheckTime(new Date().toISOString());
          return;
        }

        // Get the latest lastObservationTime from system_settings
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'lastObservationTime')
          .single();

        if (error) {
          console.error('Error checking for new observations:', error);
          return;
        }

        // If we have a lastObservationTime and it's newer than our last check
        if (data && data.value && data.value > lastCheckTime) {
          // Fetch the newest observations since our last check
          const { data: obsData, error: obsError } = await supabase
            .from('observations')
            .select('id, description')
            .gt('created_at', lastCheckTime)
            .order('created_at', { ascending: false })
            .limit(5);

          if (obsError) {
            console.error('Error fetching new observations:', obsError);
            return;
          }

          // If we have new observations, show a toast
          if (obsData && obsData.length > 0) {
            toast({
              title: "Nouvelles observations",
              description: `${obsData.length} nouvelles observations ajoutées.`,
              variant: "default",
            });
          }

          // Update our last check time
          setLastCheckTime(new Date().toISOString());
        }
      } catch (err) {
        console.error('Error in notification watcher:', err);
      }
    };

    // Check immediately, then every 30 seconds
    checkForNewObservations();
    const interval = setInterval(checkForNewObservations, 30000);

    return () => clearInterval(interval);
  }, [user, lastCheckTime]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <NotificationWatcher />
        <BrowserRouter>
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Routes protégées */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/animal/:id" element={<AnimalDetailPage />} />
                <Route path="/dashboard" element={<AnimalDashboard />} />
                <Route path="/ajouter-animal" element={<AddAnimal />} />
                <Route path="/admin" element={<AdminPortal />} />
              </Route>
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
