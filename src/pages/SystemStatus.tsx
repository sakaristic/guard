// System Status Dashboard Component
// Displays real-time monitoring of system health, temperatures, and camera status

import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Battery, Thermometer, Activity, Zap, QrCode, X } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PasswordDialog from "@/components/PasswordDialog";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "@/lib/socket";
import { useToast } from "@/components/ui/use-toast";

// Interface defining camera status response structure
interface CameraStatus {
  connected: boolean;
  status: string;
  devices: Array<{
    device: string;
    active: boolean;
    info: string;
  }>;
}

// Main SystemStatus component for monitoring system health
const SystemStatus = () => {
  // State management for various system metrics and UI elements
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus | null>(null);
  const [prevCameraState, setPrevCameraState] = useState<string>('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [dashboardStatus, setDashboardStatus] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [cpuTemp, setCpuTemp] = useState<number | null>(null);
  const [gpuTemp, setGpuTemp] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Socket connection and WiFi status management
  useEffect(() => {
    // Check dashboard status
    const checkDashboardStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/voice-chat/status');
        if (response.ok) {
          setDashboardStatus(true);
          return;
        }
        
        // Try alternative localhost URL
        const altResponse = await fetch('http://127.0.0.1:5000/voice-chat/status');
        if (altResponse.ok) {
          setDashboardStatus(true);
          return;
        }
        
        setDashboardStatus(false);
      } catch (error) {
        console.error('Dashboard status check failed:', error);
        setDashboardStatus(false);
      }
    };

    // Handle socket connection events
    const handleConnect = () => {
      setSocketConnected(true);
      toast({
        title: "System Connected",
        description: "Connection to system established",
        duration: 3000
      });
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
      toast({
        title: "System Disconnected",
        description: "Connection to system lost",
        variant: "destructive",
        duration: null // Keep showing until reconnected
      });
    };

    // Fetch camera status from backend
    const fetchCameraStatus = async () => {
      try {
        console.log("Fetching camera status...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch("http://localhost:5000/system/camera", {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Camera status error response:", errorText);
          throw new Error(`Server error: ${errorText}`);
        }

        const data = await response.json();
        console.log("Camera status response:", data);
        
        // Determine the current state
        const currentState = data.connected 
          ? (data.status === "Active" ? "STREAMING" : "CONNECTED") 
          : "DISCONNECTED";

        // Only show notification if the state has changed
        if (currentState !== prevCameraState) {
          if (data.connected) {
            if (data.status === "Active") {
              toast({
                title: "Camera Streaming",
                description: `Camera is connected and streaming (${data.devices.length} devices)`,
                duration: 3000
              });
            } else {
              toast({
                title: "Camera Connected",
                description: "Camera is connected but not streaming",
                variant: "default",
                duration: 3000
              });
            }
          } else {
            toast({
              title: "Camera Disconnected",
              description: "No camera devices found",
              variant: "destructive",
              duration: 5000
            });
          }
          // Update the previous state
          setPrevCameraState(currentState);
        }
        
        // Update the camera status
        setCameraStatus(data);
        setLastUpdate(Date.now());
      } catch (error) {
        console.error("Error fetching camera status:", error);
        // Don't show toast for timeout errors (too noisy)
        if (error.name !== 'AbortError') {
          toast({
            title: "Camera Error",
            description: error.message || "Failed to check camera status",
            variant: "destructive",
            duration: 5000
          });
        }
        setCameraStatus(null);
      }
    };

    // Socket event listeners setup
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Initial connection status
    setSocketConnected(socket.connected);

    // Temperature monitoring setup
    const fetchTemperatures = async () => {
      try {
        const response = await fetch("http://localhost:5000/system/temperature");
        if (!response.ok) throw new Error("Failed to fetch temperatures");
        const data = await response.json();
        setCpuTemp(data.cpu);
        setGpuTemp(data.gpu);
      } catch (error) {
        console.error("Error fetching temperatures:", error);
      }
    };

    // Initial fetches and polling intervals
    fetchCameraStatus();
    const cameraInterval = setInterval(fetchCameraStatus, 5000); // Update every 5 seconds

    // Set up temperature polling
    const tempInterval = setInterval(fetchTemperatures, 2000); // Update every 2 seconds
    fetchTemperatures(); // Initial fetch

    // Initial checks
    checkDashboardStatus();

    // Set up polling interval for dashboard status
    const statusInterval = setInterval(checkDashboardStatus, 5000);

    // Cleanup event listeners and intervals
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      clearInterval(tempInterval);
      clearInterval(cameraInterval);
      clearInterval(statusInterval);
    };
  }, [toast, prevCameraState]);

  // Handle successful password entry
  const handlePasswordSuccess = () => {
    setShowPassword(false);
    navigate("/settings/general");
  };
  
  // Render system status dashboard
  return (
    <div className="w-[1280px] mx-auto bg-background">
      <Header />
      
      <div className="p-8">
        <h1 className="text-2xl font-bold text-center mb-8">SYSTEM STATUS</h1>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="p-6 text-center">
            <CardContent className="p-0">
              <div className="mb-4">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-muted fill-none stroke-current stroke-2"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-primary fill-none stroke-current stroke-2"
                      strokeDasharray="80, 100"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">80%</span>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground font-bold">BATTERY LEVEL</p>
            </CardContent>
          </Card>
          
          <Card className="p-6 text-center">
            <CardContent className="p-0">
              <div className="mb-4">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-muted fill-none stroke-current stroke-2"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-primary fill-none stroke-current stroke-2"
                      strokeDasharray="90, 100"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">90%</span>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground font-bold">SYSTEM HEALTH</p>
            </CardContent>
          </Card>
        </div>
        
          <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center">
            <CardContent className="p-0">
              <div className="mb-4">
                <div className={`text-xl font-bold ${dashboardStatus ? 'text-success' : 'text-destructive'} mb-2`}>
                  {dashboardStatus ? 'ONLINE' : 'OFFLINE'}
                </div>
              </div>
              <p className="text-muted-foreground font-bold">DASHBOARD STATUS</p>
            </CardContent>
          </Card>
          
          <Card className="p-6 text-center">
            <CardContent className="p-0">
              <div className="mb-4">
                <div className={`text-xl font-bold ${
                  cameraStatus?.connected 
                    ? 'text-green-500'  // Bright green for connected
                    : 'text-red-500'    // Red for disconnected
                } mb-2`}>
                  {cameraStatus?.connected 
                    ? 'CONNECTED'
                    : 'DISCONNECTED'
                  }
                </div>
                {cameraStatus?.devices.map((device, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {device.device}: {device.active ? 'Active' : 'Inactive'}
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground font-bold">CAMERA STATUS</p>
            </CardContent>
          </Card>
          
          <Card 
            className="p-4 text-center bg-info text-white cursor-pointer hover:bg-info/90 transition-colors"
            onClick={() => setShowPassword(true)}
          >
            <CardContent className="p-0">
              <div className="mb-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-bold">CHARGING</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="p-6 text-center">
            <CardContent className="p-0">
              <div className="mb-4">
                <div className="text-3xl font-bold mb-2">
                  {typeof cpuTemp === 'number' ? `${cpuTemp}°C` : "--°C"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {cpuTemp && cpuTemp > 80 ? "High!" : 
                   cpuTemp && cpuTemp > 60 ? "Warm" : 
                   cpuTemp ? "Normal" : "Reading..."}
                </div>
              </div>
              <p className="text-muted-foreground font-bold">CPU TEMPERATURE</p>
            </CardContent>
          </Card>
          
          <Card className="p-6 text-center">
            <CardContent className="p-0">
              <div className="mb-4">
                <div className="text-3xl font-bold mb-2">
                  {typeof gpuTemp === 'number' ? `${gpuTemp}°C` : "--°C"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {gpuTemp && gpuTemp > 80 ? "High!" : 
                   gpuTemp && gpuTemp > 60 ? "Warm" : 
                   gpuTemp ? "Normal" : "Reading..."}
                </div>
              </div>
              <p className="text-muted-foreground font-bold">GPU TEMPERATURE</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end">
          <button 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            onClick={() => setShowQRModal(true)}
          >
            <QrCode className="w-4 h-4" />
            QR FOR PRIVACY POLICY
          </button>
        </div>
      </div>
      
      <BottomNav />
      
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md mx-auto bg-card border border-border rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold mb-4">
              SCAN WITH PHONE FOR PRIVACY POLICY
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-8">
            <div className="w-64 h-64 bg-white rounded-lg p-4 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                  <pattern id="qrPattern" patternUnits="userSpaceOnUse" width="10" height="10">
                    <rect width="10" height="10" fill="white"/>
                  </pattern>
                </defs>
                {/* QR Code pattern - simplified representation */}
                <rect x="0" y="0" width="40" height="40" fill="black"/>
                <rect x="160" y="0" width="40" height="40" fill="black"/>
                <rect x="0" y="160" width="40" height="40" fill="black"/>
                <rect x="10" y="10" width="20" height="20" fill="white"/>
                <rect x="170" y="10" width="20" height="20" fill="white"/>
                <rect x="10" y="170" width="20" height="20" fill="white"/>
                <rect x="15" y="15" width="10" height="10" fill="black"/>
                <rect x="175" y="15" width="10" height="10" fill="black"/>
                <rect x="15" y="175" width="10" height="10" fill="black"/>
                
                {/* Random QR pattern blocks */}
                <rect x="50" y="20" width="10" height="10" fill="black"/>
                <rect x="70" y="20" width="10" height="10" fill="black"/>
                <rect x="90" y="20" width="10" height="10" fill="black"/>
                <rect x="110" y="20" width="10" height="10" fill="black"/>
                <rect x="130" y="20" width="10" height="10" fill="black"/>
                
                <rect x="50" y="40" width="10" height="10" fill="black"/>
                <rect x="80" y="40" width="10" height="10" fill="black"/>
                <rect x="120" y="40" width="10" height="10" fill="black"/>
                
                <rect x="60" y="60" width="10" height="10" fill="black"/>
                <rect x="90" y="60" width="10" height="10" fill="black"/>
                <rect x="110" y="60" width="10" height="10" fill="black"/>
                <rect x="140" y="60" width="10" height="10" fill="black"/>
                
                <rect x="50" y="80" width="10" height="10" fill="black"/>
                <rect x="80" y="80" width="10" height="10" fill="black"/>
                <rect x="100" y="80" width="10" height="10" fill="black"/>
                <rect x="130" y="80" width="10" height="10" fill="black"/>
                <rect x="150" y="80" width="10" height="10" fill="black"/>
                
                <rect x="70" y="100" width="10" height="10" fill="black"/>
                <rect x="90" y="100" width="10" height="10" fill="black"/>
                <rect x="120" y="100" width="10" height="10" fill="black"/>
                <rect x="140" y="100" width="10" height="10" fill="black"/>
                
                <rect x="50" y="120" width="10" height="10" fill="black"/>
                <rect x="80" y="120" width="10" height="10" fill="black"/>
                <rect x="110" y="120" width="10" height="10" fill="black"/>
                <rect x="150" y="120" width="10" height="10" fill="black"/>
                
                <rect x="60" y="140" width="10" height="10" fill="black"/>
                <rect x="90" y="140" width="10" height="10" fill="black"/>
                <rect x="130" y="140" width="10" height="10" fill="black"/>
                
                <rect x="50" y="160" width="10" height="10" fill="black"/>
                <rect x="70" y="160" width="10" height="10" fill="black"/>
                <rect x="100" y="160" width="10" height="10" fill="black"/>
                <rect x="120" y="160" width="10" height="10" fill="black"/>
                <rect x="150" y="160" width="10" height="10" fill="black"/>
                
                <rect x="60" y="180" width="10" height="10" fill="black"/>
                <rect x="80" y="180" width="10" height="10" fill="black"/>
                <rect x="110" y="180" width="10" height="10" fill="black"/>
                <rect x="140" y="180" width="10" height="10" fill="black"/>
              </svg>
            </div>
          </div>
          <div className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <QrCode className="w-4 h-4" />
              QR FOR PRIVACY POLICY
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <PasswordDialog
        open={showPassword}
        onClose={() => setShowPassword(false)}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  );
};

export default SystemStatus;