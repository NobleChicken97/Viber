/**
 * useMoodDetection Hook
 * 
 * Provides real-time mood detection using ONNX Runtime Web.
 * Loads the trained FER model and performs inference on video frames.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as ort from 'onnxruntime-web';

export type Mood = 'sad' | 'calm' | 'romantic' | 'happy' | 'energetic';

export interface MoodPrediction {
  mood: Mood;
  confidence: number;
  probabilities: Record<Mood, number>;
}

interface UseMoodDetectionResult {
  isLoading: boolean;
  error: string | null;
  prediction: MoodPrediction | null;
  detectMood: (imageData: ImageData) => Promise<MoodPrediction | null>;
}

const MOOD_LABELS: Mood[] = ['sad', 'calm', 'romantic', 'happy', 'energetic'];

export function useMoodDetection(): UseMoodDetectionResult {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<MoodPrediction | null>(null);
  const sessionRef = useRef<ort.InferenceSession | null>(null);

  // Load ONNX model on mount
  useEffect(() => {
    let mounted = true;

    async function loadModel() {
      try {
        setIsLoading(true);
        setError(null);

        // Configure ONNX Runtime for browser (use CDN for WASM files)
        ort.env.wasm.numThreads = 1;
        
        // Load model
        const session = await ort.InferenceSession.create('/mood_detector.onnx', {
          executionProviders: ['wasm'],
          graphOptimizationLevel: 'all'
        });

        if (mounted) {
          sessionRef.current = session;
          setIsLoading(false);
          if (process.env.NODE_ENV === 'development') {
            console.log('Mood detection model loaded successfully');
          }
        }
      } catch (err) {
        console.error('Failed to load mood detection model:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load model');
          setIsLoading(false);
        }
      }
    }

    loadModel();

    return () => {
      mounted = false;
    };
  }, []);

  // Preprocess image for model input
  const preprocessImage = useCallback((imageData: ImageData): Float32Array => {
    const { width, height, data } = imageData;
    
    // Convert to grayscale and resize to 48x48
    const inputSize = 48;
    const grayscale = new Uint8Array(inputSize * inputSize);
    
    const scaleX = width / inputSize;
    const scaleY = height / inputSize;
    
    for (let y = 0; y < inputSize; y++) {
      for (let x = 0; x < inputSize; x++) {
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);
        const srcIdx = (srcY * width + srcX) * 4;
        
        // Convert RGB to grayscale (luminosity method)
        const r = data[srcIdx];
        const g = data[srcIdx + 1];
        const b = data[srcIdx + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        grayscale[y * inputSize + x] = gray;
      }
    }
    
    // Normalize to [-1, 1] as per training
    const normalized = new Float32Array(inputSize * inputSize);
    for (let i = 0; i < grayscale.length; i++) {
      normalized[i] = (grayscale[i] / 255.0 - 0.5) / 0.5;
    }
    
    return normalized;
  }, []);

  // Perform mood detection
  const detectMood = useCallback(async (imageData: ImageData): Promise<MoodPrediction | null> => {
    if (!sessionRef.current) {
      console.warn('Model not loaded yet');
      return null;
    }

    try {
      // Preprocess image
      const input = preprocessImage(imageData);
      
      // Create tensor [1, 1, 48, 48]
      const tensor = new ort.Tensor('float32', input, [1, 1, 48, 48]);
      
      // Run inference
      const outputs = await sessionRef.current.run({ input: tensor });
      const outputData = outputs.output.data as Float32Array;
      
      // Apply softmax to get probabilities
      const logits = Array.from(outputData);
      const maxLogit = Math.max(...logits);
      const expScores = logits.map(x => Math.exp(x - maxLogit));
      const sumExp = expScores.reduce((a, b) => a + b, 0);
      const probabilities = expScores.map(x => x / sumExp);
      
      // Find predicted mood
      const maxIdx = probabilities.indexOf(Math.max(...probabilities));
      const mood = MOOD_LABELS[maxIdx];
      const confidence = probabilities[maxIdx];
      
      // Create probabilities object
      const probabilitiesObj = MOOD_LABELS.reduce((acc, label, idx) => {
        acc[label] = probabilities[idx];
        return acc;
      }, {} as Record<Mood, number>);
      
      const result: MoodPrediction = {
        mood,
        confidence,
        probabilities: probabilitiesObj
      };
      
      setPrediction(result);
      return result;
    } catch (err) {
      console.error('Mood detection failed:', err);
      setError(err instanceof Error ? err.message : 'Detection failed');
      return null;
    }
  }, [preprocessImage]);

  return {
    isLoading,
    error,
    prediction,
    detectMood
  };
}
