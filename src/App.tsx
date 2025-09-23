/**
 * Main Application Entry Point
 * This file sets up the core application structure with essential providers and routing
 */

// UI Component imports for notifications and tooltips
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Data management and routing imports
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// Page component imports
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import General from "./pages/settings/General";
import Display from "./pages/settings/Display";
import WiFiSettings from "./pages/settings/WiFi";
import About from "./pages/settings/About";
import Help from "./pages/settings/Help";
import SystemStatus from "./pages/SystemStatus";
import NotFound from "./pages/NotFound";

// Initialize React Query client for data fetching management
const queryClient = new QueryClient();

/**
 * Root Application Component
 * Configures the application with:
 * - QueryClientProvider: Manages API data fetching and caching
 * - ThemeProvider: Handles theme management (light/dark/system)
 * - TooltipProvider: Provides tooltip functionality across the app
 * - BrowserRouter: Handles client-side routing
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* Theme configuration with system preference support */}
    <ThemeProvider 
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={['light', 'dark', 'auto']}
    >
      <TooltipProvider>
        {/* Toast notification systems */}
        <Toaster />
        <Sonner />
        
        {/* Application routing configuration */}
        <BrowserRouter>
          <Routes>
            {/* Main dashboard route */}
            <Route path="/" element={<Index />} />
            
            {/* Settings section routes */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/general" element={<General />} />
            <Route path="/settings/display" element={<Display />} />
            <Route path="/settings/wifi" element={<WiFiSettings />} />
            <Route path="/settings/about" element={<About />} />
            <Route path="/settings/help" element={<Help />} />
            
            {/* System monitoring route */}
            <Route path="/system-status" element={<SystemStatus />} />
            
            {/* Catch-all route for 404 handling */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
