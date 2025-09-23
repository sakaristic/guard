// Push-to-Talk (PTT) Button Component
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MicOff, Volume2, Mic } from "lucide-react";
import { voiceChat } from "@/lib/voiceChat";
import { socket } from "@/lib/socket";

const TalkButton = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isMuting, setIsMuting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState('');

  const checkConnection = async () => {
    setLastConnectionAttempt(new Date().toLocaleTimeString());
    
    try {
      const response = await fetch('http://localhost:5000/voice-chat/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setIsConnected(true);
        return true;
      }
      
      // Try alternative localhost URL
      const altResponse = await fetch('http://127.0.0.1:5000/voice-chat/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (altResponse.ok) {
        setIsConnected(true);
        return true;
      }
    } catch (error) {
      console.error('Connection check failed:', error);
    }

    setIsConnected(false);
    return false;
  };

  const handleMicToggle = async () => {
    if (!isConnected) {
      alert('Cannot activate microphone: Not connected to the server');
      return;
    }

    setIsMuting(true);
    try {
      if (!voiceChat.isSocketConnected()) {
        socket.connect();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (isMicMuted) {
        const success = await voiceChat.startVoiceChat();
        if (success) {
          setIsMicMuted(false);
          voiceChat.startTransmitting();
        } else {
          throw new Error('Failed to start voice chat');
        }
      } else {
        voiceChat.stopTransmitting();
        voiceChat.stopVoiceChat();
        setIsMicMuted(true);
      }
    } catch (error) {
      console.error('Failed to toggle voice chat:', error);
      setIsMicMuted(true);
      alert('❌ Failed to control microphone: ' + (error.message || 'Unknown error'));
    } finally {
      setIsMuting(false);
    }
  };

  const handleRestartReceiveOnly = async () => {
    setIsRestarting(true);
    try {
      const credentials = {
        host: window.location.hostname || '192.168.0.101',
        username: 'jetson',
        password: sessionStorage.getItem('jetsonPassword') || prompt('Enter Jetson password to force receive-only mode:')
      };

      if (!credentials.password) {
        setIsRestarting(false);
        return;
      }

      sessionStorage.setItem('jetsonPassword', credentials.password);

      const response = await fetch('http://192.168.0.206:3004/voip/force-receive-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Success: ${result.message}`);
        setIsMicMuted(true);
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

  useEffect(() => {
    const checkConnectionAndSocket = async () => {
      const connectionOk = await checkConnection();
      if (connectionOk && !voiceChat.isSocketConnected()) {
        socket.connect();
      }
    };

    checkConnectionAndSocket();
    const interval = setInterval(checkConnectionAndSocket, 5000);
    
    if (!isConnected) {
      voiceChat.stopTransmitting();
      voiceChat.stopVoiceChat();
      setIsMicMuted(true);
    }
    
    return () => {
      clearInterval(interval);
      voiceChat.stopTransmitting();
      voiceChat.stopVoiceChat();
    };
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
    </div>
  );
};

export default TalkButton;