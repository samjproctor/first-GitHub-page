export interface AudioSource {
  id: string;
  panner: PannerNode;
  gain: GainNode;
  oscillator?: OscillatorNode;
  bufferSource?: AudioBufferSourceNode;
}

export class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sources: Map<string, AudioSource> = new Map();
  private isInitialized = false;

  constructor() {
    // We defer initialization until user interaction to comply with browser autoplay policies
  }

  public init() {
    if (this.isInitialized) return;

    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    
    // Set default listener parameters
    const listener = this.context.listener;
    
    // Position listener at origin by default
    if (listener.positionX) {
      listener.positionX.value = 0;
      listener.positionY.value = 0;
      listener.positionZ.value = 0;
      listener.forwardX.value = 0;
      listener.forwardY.value = 0;
      listener.forwardZ.value = -1;
      listener.upX.value = 0;
      listener.upY.value = 1;
      listener.upZ.value = 0;
    } else {
      // Fallback for older browsers
      listener.setPosition(0, 0, 0);
      listener.setOrientation(0, 0, -1, 0, 1, 0);
    }

    this.isInitialized = true;
  }

  public getContext(): AudioContext | null {
    return this.context;
  }

  public updateListenerPosition(x: number, y: number, z: number, forward?: {x: number, y: number, z: number}, up?: {x: number, y: number, z: number}) {
    if (!this.context) return;
    
    const listener = this.context.listener;
    
    if (listener.positionX) {
      listener.positionX.setTargetAtTime(x, this.context.currentTime, 0.1);
      listener.positionY.setTargetAtTime(y, this.context.currentTime, 0.1);
      listener.positionZ.setTargetAtTime(z, this.context.currentTime, 0.1);
      
      if (forward) {
        listener.forwardX.setTargetAtTime(forward.x, this.context.currentTime, 0.1);
        listener.forwardY.setTargetAtTime(forward.y, this.context.currentTime, 0.1);
        listener.forwardZ.setTargetAtTime(forward.z, this.context.currentTime, 0.1);
      }
      
      if (up) {
        listener.upX.setTargetAtTime(up.x, this.context.currentTime, 0.1);
        listener.upY.setTargetAtTime(up.y, this.context.currentTime, 0.1);
        listener.upZ.setTargetAtTime(up.z, this.context.currentTime, 0.1);
      }
    } else {
      // Fallback
      listener.setPosition(x, y, z);
      if (forward && up) {
         listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
      }
    }
  }

  public createTestToneSource(id: string, frequency: number = 440): AudioSource | null {
    if (!this.context || !this.masterGain) return null;
    
    if (this.sources.has(id)) {
      this.removeSource(id);
    }

    const oscillator = this.context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    const panner = this.context.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1;

    const gain = this.context.createGain();
    gain.gain.value = 0; // Start muted

    oscillator.connect(panner);
    panner.connect(gain);
    gain.connect(this.masterGain);

    oscillator.start();

    const source: AudioSource = { id, panner, gain, oscillator };
    this.sources.set(id, source);
    
    return source;
  }

  public updateSourcePosition(id: string, x: number, y: number, z: number) {
    if (!this.context) return;
    
    const source = this.sources.get(id);
    if (!source) return;

    if (source.panner.positionX) {
      source.panner.positionX.setTargetAtTime(x, this.context.currentTime, 0.1);
      source.panner.positionY.setTargetAtTime(y, this.context.currentTime, 0.1);
      source.panner.positionZ.setTargetAtTime(z, this.context.currentTime, 0.1);
    } else {
      source.panner.setPosition(x, y, z);
    }
  }

  public setSourceVolume(id: string, volume: number) {
    if (!this.context) return;
    
    const source = this.sources.get(id);
    if (!source) return;

    source.gain.gain.setTargetAtTime(volume, this.context.currentTime, 0.05);
  }

  public removeSource(id: string) {
    const source = this.sources.get(id);
    if (source) {
      if (source.oscillator) {
        source.oscillator.stop();
        source.oscillator.disconnect();
      }
      if (source.bufferSource) {
        source.bufferSource.stop();
        source.bufferSource.disconnect();
      }
      source.panner.disconnect();
      source.gain.disconnect();
      this.sources.delete(id);
    }
  }
  
  public resume() {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  public suspend() {
    if (this.context && this.context.state === 'running') {
      this.context.suspend();
    }
  }

  public destroy() {
    this.sources.forEach((_, id) => this.removeSource(id));
    if (this.context) {
      this.context.close();
      this.context = null;
    }
    this.isInitialized = false;
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
