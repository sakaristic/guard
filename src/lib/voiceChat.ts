import { io, Socket } from 'socket.io-client';
import { getConfig } from './config';

class VoiceChat {
  private socket: Socket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private micStream: MediaStream | null = null;
  private isActive: boolean = false;
  private isTransmitting: boolean = false;
  private volume: number = 1.0;
  private gainNode: GainNode | null = null;

  constructor() {
    this.setupSocket();
    this.setupAudioContext();
  }

  private setupSocket() {
    const config = getConfig();
    this.socket = io(`${config.backendUrl}/voice`, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 5000
    });

    this.socket.on('connect', () => {
      console.log('Voice chat socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Voice chat socket disconnected:', reason);
      this.stopVoiceChat();  // Stop voice chat on disconnect
    });

    this.socket.on('connect_error', (error) => {
      console.error('Voice chat socket connection error:', error);
    });

    this.socket.on('voice_data', this.handleIncomingVoice.bind(this));
    this.socket.on('status_update', (status: { connected_clients: number, active_voice: number }) => {
      console.log('Voice chat status:', status);
    });
  }

  private async setupAudioContext() {
    try {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.setVolume(this.volume);
    } catch (error) {
      console.error('Failed to create AudioContext:', error);
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  private async setupMicStream() {
    // Clean up any existing streams first
    this.cleanupAudioResources();

    try {
      console.log('Requesting microphone access...');
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
          sampleRate: 44100,
        },
        video: false
      });
      console.log('Microphone access granted');

      // Create a new audio context if needed
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      const source = this.audioContext.createMediaStreamSource(this.micStream);
      
      // Check for supported codecs
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      console.log('Using MIME type:', mimeType);
      
      this.mediaRecorder = new MediaRecorder(this.micStream, {
        mimeType: mimeType,
        audioBitsPerSecond: 32000,
      });

      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && this.isTransmitting && this.socket?.connected) {
          try {
            const buffer = await event.data.arrayBuffer();
            const uint8Array = new Uint8Array(buffer);
            this.socket.emit('voice_data', uint8Array);
          } catch (error) {
            console.error('Error processing audio data:', error);
          }
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.stopVoiceChat();
      };

      console.log('Starting MediaRecorder...');
      this.mediaRecorder.start(100); // Capture in 100ms chunks
      console.log('MediaRecorder started successfully');
    } catch (error) {
      console.error('Failed to setup mic stream:', error);
      this.cleanupAudioResources();
      throw error;
    }
  }

  private cleanupAudioResources() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
      this.mediaRecorder = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping audio track:', e);
        }
      });
      this.micStream = null;
    }
  }

  private async handleIncomingVoice(data: Uint8Array) {
    if (!this.isActive || this.isTransmitting || !this.audioContext || !this.gainNode) return;

    try {
      // Create a new ArrayBuffer and copy the data
      const arrayBuffer = new ArrayBuffer(data.byteLength);
      new Uint8Array(arrayBuffer).set(data);
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode);
      source.start(0);
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }

  public async startVoiceChat() {
    if (this.isActive) return;
    
    try {
      await this.setupMicStream();
      this.isActive = true;
      return true;
    } catch (error) {
      console.error('Failed to start voice chat:', error);
      return false;
    }
  }

  public stopVoiceChat() {
    this.isActive = false;
    this.isTransmitting = false;
    
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
  }

  public startTransmitting() {
    if (!this.isActive) return;
    this.isTransmitting = true;
  }

  public stopTransmitting() {
    this.isTransmitting = false;
  }

  public isVoiceChatActive() {
    return this.isActive;
  }

  public isSocketConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Create a singleton instance
export const voiceChat = new VoiceChat();