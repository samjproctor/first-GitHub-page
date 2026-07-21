// A basic WebWorker for handling advanced acoustic simulation calculations

// In a real application, this might process ray-tracing acoustics, calculate early reflections, 
// or update physics bodies without blocking the main UI thread.

export interface SimulationMessage {
  type: 'INIT' | 'UPDATE_LISTENER' | 'UPDATE_SOURCE' | 'CALCULATE_REFLECTIONS';
  payload?: any;
}

export interface SimulationResult {
  type: 'SIMULATION_RESULT' | 'INITIALIZED';
  payload?: any;
}

// Internal state for the simulation
let isInitialized = false;
let sources: Record<string, {x: number, y: number, z: number}> = {};
let listener = {x: 0, y: 0, z: 0};

self.onmessage = (event: MessageEvent<SimulationMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'INIT':
      isInitialized = true;
      self.postMessage({ type: 'INITIALIZED' } as SimulationResult);
      break;

    case 'UPDATE_LISTENER':
      if (payload) {
        listener = { ...listener, ...payload };
      }
      break;

    case 'UPDATE_SOURCE':
      if (payload && payload.id) {
        sources[payload.id] = { x: payload.x, y: payload.y, z: payload.z };
      }
      break;

    case 'CALCULATE_REFLECTIONS':
      if (!isInitialized) return;
      
      // Stub for advanced calculations
      // E.g., computing paths from sources to listener bouncing off walls.
      const reflections = calculateMockReflections();
      
      self.postMessage({
        type: 'SIMULATION_RESULT',
        payload: { reflections }
      } as SimulationResult);
      break;
  }
};

function calculateMockReflections() {
  // Mock logic: calculate simple distances and return mock reflection points
  const results = [];
  
  for (const [id, source] of Object.entries(sources)) {
    const dx = listener.x - source.x;
    const dy = listener.y - source.y;
    const dz = listener.z - source.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Create a mock reflection
    results.push({
      sourceId: id,
      distance: distance,
      // For instance, a reflection coming from an opposite wall
      reflectionVector: { x: -dx, y: dy, z: dz },
      delayMs: (distance / 343) * 1000 // Speed of sound roughly 343 m/s
    });
  }
  
  return results;
}
