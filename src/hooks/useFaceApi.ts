import { useState, useEffect, useCallback, useRef } from 'react';
import type { Mood } from "@/lib/moodTheme";

type MLState = 'idle' | 'loading' | 'ready' | 'error';

const expressionToMoodMap: Record<string, Mood> = {
  'happy': 'happy',
  'sad': 'sad',
  'angry': 'energetic', // high energy
  'fearful': 'energetic',  // high energy
  'disgusted': 'energetic', // high energy
  'surprised': 'romantic', // mapping to romantic for variety, or happy
  'neutral': 'calm'
};

export function useFaceApi() {
  const [mlState, setMlState] = useState<MLState>('idle');
  const [error, setError] = useState<string | null>(null);


  const faceApiRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const loadModels = async () => {
      try {
        setMlState('loading');


        const faceapi = await import('@vladmandic/face-api');
        faceApiRef.current = faceapi;

        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        
        if (mounted) {
          setMlState('ready');
        }
      } catch (err: unknown) {
        console.error("Failed to load face-api models:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load models");
          setMlState('error');
        }
      }
    };

    loadModels();

    return () => {
      mounted = false;
    };
  }, []);

  const detectMood = useCallback(async (videoElement: HTMLVideoElement): Promise<Mood | null> => {
    if (mlState !== 'ready' || !faceApiRef.current) return null;

    try {
      const faceapi = faceApiRef.current;

      const detection = await faceapi
        .detectSingleFace(
          videoElement, 
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.9 })
        )
        .withFaceExpressions();

      if (detection) {

        const expressions = detection.expressions;
        const topExpression = Object.keys(expressions).reduce((a, b) => 
          expressions[a] > expressions[b] ? a : b
        );

        console.log("Face-API Detected Expression:", topExpression, expressions);
        return expressionToMoodMap[topExpression] || 'calm';
      }
      
      console.warn("No face detected by Face-API");
      return null;
    } catch (err) {
      console.error("Error detecting mood:", err);
      return null;
    }
  }, [mlState]);

  return { mlState, error, detectMood };
}
