import { useEffect, useRef, useState, useCallback } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import type { SimulationMessage, SimulationResult } from '../workers/simulation.worker';

export function useAudioSimulation() {
  const workerRef = useRef<Worker | null>(null);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [isEngineReady, setIsEngineReady] = useState(false);

  useEffect(() => {
    // Initialize Worker
    workerRef.current = new Worker(new URL('../workers/simulation.worker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e: MessageEvent<SimulationResult>) => {
      if (e.data.type === 'SIMULATION_RESULT') {
        setSimulationResults(e.data.payload);
      } else if (e.data.type === 'INITIALIZED') {
        console.log('Simulation Worker initialized');
      }
    };

    workerRef.current.postMessage({ type: 'INIT' } as SimulationMessage);

    return () => {
      workerRef.current?.terminate();
      audioEngine.destroy();
    };
  }, []);

  const initAudio = useCallback(() => {
    audioEngine.init();
    audioEngine.resume();
    setIsEngineReady(true);
  }, []);

  const updateListener = useCallback((x: number, y: number, z: number) => {
    if (!isEngineReady) return;
    audioEngine.updateListenerPosition(x, y, z);
    workerRef.current?.postMessage({
      type: 'UPDATE_LISTENER',
      payload: { x, y, z }
    } as SimulationMessage);
  }, [isEngineReady]);

  const updateSource = useCallback((id: string, x: number, y: number, z: number) => {
    if (!isEngineReady) return;
    audioEngine.updateSourcePosition(id, x, y, z);
    workerRef.current?.postMessage({
      type: 'UPDATE_SOURCE',
      payload: { id, x, y, z }
    } as SimulationMessage);
  }, [isEngineReady]);

  const calculateReflections = useCallback(() => {
    workerRef.current?.postMessage({ type: 'CALCULATE_REFLECTIONS' } as SimulationMessage);
  }, []);

  return {
    initAudio,
    isEngineReady,
    updateListener,
    updateSource,
    calculateReflections,
    simulationResults,
    audioEngine
  };
}
