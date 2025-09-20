import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MicOff, Volume2, Mic } from "lucide-react";
import { voiceChat } from "@/lib/voiceChat";
import { socket } from "@/lib/socket";
 
const TalkButton = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(true); // Start with mic muted
  const [isMuting, setIsMuting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState('Never');
 
  // Check connection to backend server
  const checkConnection = async () => {
    setLastConnectionAttempt(new Date().toLocaleTimeString());
    setConnectionStatus('Testing...');
    
    try {
      // Check local backend connection
      const response = await fetch('http://localhost:5000/voice-chat/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setIsConnected(true);
        setConnectionStatus('✅ Connected to voice chat server');
        return true;
      } else {
        const error = await response.text();
        setConnectionStatus(`❌ Server error: ${error}`);
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus(`❌ Connection failed - ${error.message}`);

      // Try alternative localhost URL
      try {
        const altResponse = await fetch('http://127.0.0.1:5000/voice-chat/status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (altResponse.ok) {
          setIsConnected(true);
          setConnectionStatus('✅ Connected to voice chat server (127.0.0.1)');
          return true;
        }
      } catch (altError) {
        console.error('Alternative connection check failed:', altError);
      }
    }
 
    setIsConnected(false);
    return false;
  };
 
  // Toggle microphone mute/unmute
  const handleMicToggle = async () => {
    if (!isConnected) {
      alert('Cannot activate microphone: Not connected to the server');
      return;
    }

    setIsMuting(true);
    try {
      // First check if socket is connected
      if (!voiceChat.isSocketConnected()) {
        console.log('Socket not connected, attempting to reconnect...');
        socket.connect();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for connection
      }

      if (isMicMuted) {
        // Turn ON: Red -> Green
        console.log('Turning microphone ON');
        const success = await voiceChat.startVoiceChat();
        if (success) {
          setIsMicMuted(false);
          voiceChat.startTransmitting();
          console.log('✅ Voice chat started successfully');
        } else {
          throw new Error('Failed to start voice chat');
        }
      } else {
        // Turn OFF: Green -> Red
        console.log('Turning microphone OFF');
        voiceChat.stopTransmitting();
        voiceChat.stopVoiceChat();
        setIsMicMuted(true);
        console.log('✅ Voice chat stopped successfully');
      }
    } catch (error) {
      console.error('Failed to toggle voice chat:', error);
      setIsMicMuted(true); // Ensure mic is marked as off on error
      alert('❌ Failed to control microphone: ' + (error.message || 'Unknown error'));
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
 
  // Check connection and socket status on component mount
  useEffect(() => {
    const checkConnectionAndSocket = async () => {
      const connectionOk = await checkConnection();
      if (connectionOk && !voiceChat.isSocketConnected()) {
        console.log('Reconnecting voice chat socket...');
        socket.connect();
      }
    };

    checkConnectionAndSocket();
    // Check connection every 5 seconds
    const interval = setInterval(checkConnectionAndSocket, 5000);
    
    // Stop voice chat if connection is lost
    if (!isConnected) {
      voiceChat.stopTransmitting();
      voiceChat.stopVoiceChat();
      setIsMicMuted(true);
    }
    
    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      voiceChat.stopTransmitting();
      voiceChat.stopVoiceChat();
    }
  }, [isConnected]);
 
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Button
        size="lg"
        onClick={handleMicToggle}
        disabled={isMuting || !isConnected}
        className={`w-64 h-64 rounded-full text-white text-xl font-bold shadow-2xl ${
          !isConnected 
            ? 'bg-gray-400 cursor-not-allowed'
            : isMicMuted 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
        } transition-colors duration-300 flex flex-col items-center justify-center gap-2`}
      >
        {isMicMuted ? (
          <>
            <MicOff className="h-8 w-8" />
            MIC OFF
          </>
        ) : (
          <>
            <Mic className="h-8 w-8" />
            MIC ON
          </>
        )}
      </Button>
      
      {/* Connection Status */}
      <div className={`text-sm font-medium ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
        {isConnected ? '🟢 Voice Chat Server Connected' : '🔴 Voice Chat Server Connection Failed'}
      </div>
      
      {/* Manual Connection Test */}
      {!isConnected && (
        <div className="text-xs text-center space-y-2">
          <div className="text-orange-600">
            Connection failed. Make sure the backend server is running on port 5000.
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
      
      {/* Voice Chat Status */}
      {isConnected && (
        <div className="text-xs text-center space-y-1">
          <div className="text-blue-600">
            Voice chat server ready
          </div>
          <div className="text-gray-600">
            Click the button to toggle microphone
          </div>
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
      
      {/* Usage Tip */}
      <div className="text-xs text-blue-600 text-center">
        Click the button to toggle microphone
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