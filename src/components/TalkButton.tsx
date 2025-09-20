import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MicOff, Volume2, Mic } from "lucide-react";
 
const TalkButton = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(true); // Start with mic muted
  const [isMuting, setIsMuting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState('Never');
 
  // Check connection to main dashboard
  const checkConnection = async () => {
    setLastConnectionAttempt(new Date().toLocaleTimeString());
    setConnectionStatus('Testing...');
    
    try {
      // First try the main dashboard IP
      const response = await fetch('http://192.168.0.206:3004/api/ping', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setIsConnected(true);
        setConnectionStatus('✅ Connected to 192.168.0.206:3004');
        return true;
      } else {
        setConnectionStatus(`❌ 192.168.0.206:3004 responded with ${response.status}`);
      }
    } catch (error) {
      setConnectionStatus(`❌ 192.168.0.206:3004 - ${error.message}`);
      console.log('Failed to connect to 192.168.0.206:3004, trying localhost:', error);
    }
 
    try {
      // Fallback: try localhost (if both are running on same machine for testing)
      const response = await fetch('http://localhost:3004/api/ping', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setIsConnected(true);
        setConnectionStatus('✅ Connected to localhost:3004');
        return true;
      } else {
        setConnectionStatus(`❌ Both servers failed. localhost:3004 responded with ${response.status}`);
      }
    } catch (error) {
      setConnectionStatus(`❌ Both servers failed. localhost:3004 - ${error.message}`);
      console.log('Failed to connect to localhost:3004:', error);
    }
 
    setIsConnected(false);
    return false;
  };
 
  // Toggle microphone mute/unmute
  const handleMicToggle = async () => {
    setIsMuting(true);
    try {
      const credentials = {
        host: window.location.hostname || '192.168.0.101',
        username: 'jetson',
        password: sessionStorage.getItem('jetsonPassword') || prompt('Enter Jetson password:')
      };
 
      if (!credentials.password) {
        setIsMuting(false);
        return;
      }
 
      // Store password temporarily for this session
      sessionStorage.setItem('jetsonPassword', credentials.password);
 
      const action = isMicMuted ? 'unmute' : 'mute';
      
      // Try multiple server URLs
      const serverUrls = [
        'http://192.168.0.206:3004',
        'http://localhost:3004'
      ];
 
      let success = false;
      let lastError = null;
 
      for (const serverUrl of serverUrls) {
        try {
          const response = await fetch(`${serverUrl}/voip/mic-control`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...credentials,
              action: action
            })
          });
 
          if (response.ok) {
            const result = await response.json();
            setIsMicMuted(!isMicMuted);
            setIsConnected(true); // Update connection status
            console.log(`✅ Microphone ${action}d successfully via ${serverUrl}`);
            success = true;
            break;
          } else {
            const error = await response.json();
            lastError = error.error;
          }
        } catch (error) {
          lastError = error.message;
          console.log(`Failed to connect to ${serverUrl}:`, error);
        }
      }
 
      if (!success) {
        alert(`❌ Failed to ${action} microphone: ${lastError}`);
      }
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
      alert('❌ Failed to control microphone. Check console for details.');
    } finally {
      setIsMuting(false);
    }
  };
 
  // Force restart VoIP in receive-only mode
  const handleRestartReceiveOnly = async () => {
    setIsRestarting(true);
    try {
      // Get credentials from user (in a real app, these might be stored securely)
      const credentials = {
        host: window.location.hostname || '192.168.0.101', // Guard device IP
        username: 'jetson', // Default Jetson username
        password: sessionStorage.getItem('jetsonPassword') || prompt('Enter Jetson password to force receive-only mode:')
      };
 
      if (!credentials.password) {
        setIsRestarting(false);
        return;
      }
 
      // Store password temporarily for this session
      sessionStorage.setItem('jetsonPassword', credentials.password);
 
      const response = await fetch('http://192.168.0.206:3004/voip/force-receive-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
 
      if (response.ok) {
        const result = await response.json();
        alert(`✅ Success: ${result.message}`);
        setIsMicMuted(true); // Force receive-only mode mutes the mic
      } else {
        const error = await response.json();
        alert(`❌ Failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to restart:', error);
      alert('❌ Failed to force receive-only mode. Check console for details.');
    } finally {
      setIsRestarting(false);
    }
  };
 
  // Check connection on component mount
  useEffect(() => {
    checkConnection();
    // Check connection every 5 seconds
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);
 
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Button
        size="lg"
        disabled={true}
        className="w-64 h-64 rounded-full text-white text-xl font-bold shadow-2xl bg-green-600 cursor-default flex flex-col items-center justify-center gap-2"
      >
        <Volume2 className="h-8 w-8" />
        LISTENING<br />MODE
      </Button>
      
      {/* Connection Status */}
      <div className={`text-sm font-medium ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
        {isConnected ? '🟢 Connected to Main Dashboard' : '🔴 Main Dashboard Connection Failed'}
      </div>
      
      {/* Manual Connection Test */}
      {!isConnected && (
        <div className="text-xs text-center space-y-2">
          <div className="text-orange-600">
            Auto-connection failed. Click "Test Connection" or try mic button anyway.
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            className="text-xs"
          >
            Test Connection
          </Button>
        </div>
      )}
      
      {/* Audio Device Status */}
      <div className="text-xs text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          {isMicMuted ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4 text-orange-500" />}
          <span className={`font-medium ${isMicMuted ? 'text-red-600' : 'text-orange-600'}`}>
            Microphone: {isMicMuted ? 'MUTED' : 'ACTIVE'}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Volume2 className="h-4 w-4 text-green-500" />
          <span className="text-green-600 font-medium">Speaker: ENABLED</span>
        </div>
      </div>
      
      {/* Microphone Control Button */}
      <div className="flex flex-col items-center space-y-2">
        <Button
          variant={isMicMuted ? "default" : "destructive"}
          size="sm"
          onClick={handleMicToggle}
          disabled={isMuting}
          className={`w-40 text-sm font-medium transition-all duration-200 ${
            isMuting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
        >
          {isMuting ? (
            "Processing..."
          ) : isMicMuted ? (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Unmute Mic
            </>
          ) : (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Mute Mic
            </>
          )}
        </Button>
        
        {/* Usage Tip */}
        <div className="text-xs text-blue-600 text-center">
          Button will try multiple server addresses automatically
        </div>
      </div>
      
      {/* Mode Information */}
      <div className="text-xs text-gray-500 text-center">
        This device is in receive-only mode.<br />
        Audio transmission is controlled from the main dashboard.
        <br />
        <span className="text-blue-600 font-medium">Use the mute button for additional control.</span>
      </div>
 
      {/* Restart Button for Troubleshooting */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleRestartReceiveOnly}
        disabled={isRestarting}
        className="mt-2 text-xs"
      >
        {isRestarting ? "Restarting..." : "Force Receive-Only Mode"}
      </Button>
 
      {/* Debug Panel */}
      <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs space-y-1">
        <div className="font-bold text-gray-700">Connection Debug:</div>
        <div className="text-gray-600">Status: {connectionStatus}</div>
        <div className="text-gray-600">Last Check: {lastConnectionAttempt}</div>
        <div className="text-gray-600">Guard IP: {window.location.hostname || 'localhost'}</div>
        <div className="text-gray-600">Expected Main: 192.168.0.206:3004</div>
      </div>
    </div>
  );
};
 
export default TalkButton;