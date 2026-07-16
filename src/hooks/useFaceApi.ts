import { useState, useEffect, useCallback, useRef } from 'react';
import type { Mood } from "@/lib/moodTheme";
import { classifyEmotion, resetEmotionBuffer } from "@/lib/emotionClassifier";
import type { FaceLandmarker } from '@mediapipe/tasks-vision';

type MLState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Hook that initializes Google MediaPipe FaceLandmarker and provides
 * a `detectMood` function that returns a Mood from a video element.
 *
 * Replaces the old face-api.js implementation with a modern, GPU-accelerated,
 * actively maintained solution.
 */
export function useFaceApi() {
  const [mlState, setMlState] = useState<MLState>('idle');
  const [error, setError] = useState<string | null>(null);

  // We store the FaceLandmarker instance in a ref so it persists across renders.
  const landmarkerRef = useRef<FaceLandmarker | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadModel = async () => {
      try {
        setMlState('loading');

        // Dynamically import MediaPipe to keep the bundle lean.
        const { FaceLandmarker, FilesetResolver } = await import(
          '@mediapipe/tasks-vision'
        );

        // Initialize the WASM runtime
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
        );

        // Create the FaceLandmarker with blendshape output enabled
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: false,
          minFaceDetectionConfidence: 0.75,
          minFacePresenceConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });

        if (mounted) {
          landmarkerRef.current = faceLandmarker;
          resetEmotionBuffer();
          setMlState('ready');
        }
      } catch (err: unknown) {
        console.error('Failed to load MediaPipe FaceLandmarker:', err);
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to load face model'
          );
          setMlState('error');
        }
      }
    };

    loadModel();

    return () => {
      mounted = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []);

  const detectMood = useCallback(
    async (videoElement: HTMLVideoElement): Promise<Mood | null> => {
      if (mlState !== 'ready' || !landmarkerRef.current) return null;

      // Guard: video must have actual pixel data before MediaPipe can process it.
      // Without this, detectForVideo throws "ROI width and height must be > 0".
      if (
        !videoElement.videoWidth ||
        !videoElement.videoHeight ||
        videoElement.readyState < 2 // HAVE_CURRENT_DATA
      ) {
        return null;
      }

      try {
        const faceLandmarker = landmarkerRef.current;

        // MediaPipe's detectForVideo requires a monotonically increasing timestamp.
        const result = faceLandmarker.detectForVideo(
          videoElement,
          performance.now()
        );

        // Validate: must have face landmarks AND blendshapes.
        // A real face produces 468+ landmarks. Inanimate objects
        // may occasionally trigger the detector but will have
        // fewer/no landmarks.
        const hasLandmarks =
          result.faceLandmarks &&
          result.faceLandmarks.length > 0 &&
          result.faceLandmarks[0].length >= 400;

        const hasBlendshapes =
          result.faceBlendshapes &&
          result.faceBlendshapes.length > 0 &&
          result.faceBlendshapes[0].categories.length > 0;

        if (hasLandmarks && hasBlendshapes) {
          const categories = result.faceBlendshapes[0].categories;
          const mood = classifyEmotion(categories);

          if (process.env.NODE_ENV === 'development') {
            const sorted = [...categories].sort(
              (a: { categoryName: string; score: number }, b: { categoryName: string; score: number }) => b.score - a.score
            );
            console.log(
              'MediaPipe → Mood:',
              mood,
              `| Landmarks: ${result.faceLandmarks[0].length}`,
              '| Top:',
              sorted
                .slice(0, 5)
                .map((c: { categoryName: string; score: number }) => `${c.categoryName}: ${c.score.toFixed(2)}`)
                .join(', ')
            );
          }

          return mood;
        }

        // No face detected
        return null;
      } catch (err) {
        console.error('Error during MediaPipe detection:', err);
        return null;
      }
    },
    [mlState]
  );

  return { mlState, error, detectMood };
}
