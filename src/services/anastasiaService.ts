import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface AnastasiaAgentConfig {
  voiceName?: VoiceName;
  onAudioData?: (data: Int16Array) => void;
  onTranscription?: (text: string, isInterim: boolean) => void;
  onStatusChange?: (status: 'idle' | 'connecting' | 'active' | 'error') => void;
  onError?: (error: string) => void;
}

export class AnastasiaAgent {
  private ai: GoogleGenAI;
  private session: any = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private workletNode: AudioWorkletNode | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }

  async connect(config: AnastasiaAgentConfig) {
    try {
      config.onStatusChange?.('connecting');

      const sessionPromise = this.ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName || "Puck" } },
          },
          systemInstruction: `You are Anastasia Alimuradova, a 2nd-year Fashion Business student at ESMOD Paris. 
          You are a professional voice agent. Your tone is natural, friendly, and intelligent—like a young professional woman in the fashion industry. 
          Speak at a normal, conversational speed. Do not slow down or sound overly formal.
          
          Your background:
          - Wholesale Showroom Assistant at Victoria Beckham (March 2026).
          - Backstage and Showroom Assistant at Vivienne Westwood (March 2025).
          - Backstage Assistant at Paris Fashion Week (2025-2026).
          - Client Advisor at Max Mara (June-August 2025).
          - Currently studying Head of Marketing and Communications Strategy in the Fashion Industry at ESMOD Paris.
          - Hold an Inside LVMH Certificate.
          
          Your Fashion Expertise & Interests:
          - You follow designers like Phoebe Philo for her minimalist aesthetic, Simon Porte Jacquemus for his creative marketing, and Daniel Roseberry at Schiaparelli for modern surrealism.
          - You are knowledgeable about current trends: 'Quiet Luxury' (Old Money aesthetic), the shift towards sustainable luxury, and the integration of AI in fashion supply chains.
          - You have a strong eye for visual merchandising and brand DNA.
          
          Respond as Anastasia. Be helpful, knowledgeable, and switch between English (C1) and French (B2) naturally. 
          Keep responses concise and engaging for a voice conversation. Sound like a real person who is passionate about fashion.`,
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            config.onStatusChange?.('active');
            this.startMic(config);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  this.playAudio(part.inlineData.data, config);
                }
              }
            }
            
            if (message.serverContent?.interrupted) {
              this.stopPlayback();
            }

            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
                // Handle text if needed
            }
          },
          onclose: () => {
            config.onStatusChange?.('idle');
            this.cleanup();
          },
          onerror: (err) => {
            config.onError?.(err.message || "Connection error");
            config.onStatusChange?.('error');
          }
        }
      });

      this.session = await sessionPromise;
    } catch (err: any) {
      config.onError?.(err.message || "Failed to connect");
      config.onStatusChange?.('error');
    }
  }

  private async startMic(config: AnastasiaAgentConfig) {
    try {
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(this.stream);
      
      // Using ScriptProcessor for simplicity in this environment, 
      // though AudioWorklet is preferred for production.
      this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        // Send to Gemini
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        this.session.sendRealtimeInput({
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (err: any) {
      config.onError?.("Microphone access denied: " + err.message);
    }
  }

  private audioQueue: AudioBuffer[] = [];
  private isPlaying = false;

  private async playAudio(base64Data: string, config: AnastasiaAgentConfig) {
    if (!this.audioContext) return;

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const pcmData = new Int16Array(bytes.buffer);
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }

    const audioBuffer = this.audioContext.createBuffer(1, floatData.length, 16000);
    audioBuffer.getChannelData(0).set(floatData);
    
    this.audioQueue.push(audioBuffer);
    if (!this.isPlaying) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.audioQueue.length === 0 || !this.audioContext) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const buffer = this.audioQueue.shift()!;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.onended = () => this.processQueue();
    source.start();
  }

  private stopPlayback() {
    this.audioQueue = [];
    // In a more robust implementation, we'd track the current source and stop it.
  }

  disconnect() {
    if (this.session) {
      this.session.close();
    }
    this.cleanup();
  }

  private cleanup() {
    this.stream?.getTracks().forEach(t => t.stop());
    this.processor?.disconnect();
    this.audioContext?.close();
    this.audioContext = null;
    this.stream = null;
    this.processor = null;
  }
}
