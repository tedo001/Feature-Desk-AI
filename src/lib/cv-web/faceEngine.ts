// ===================================================================
// In-browser MediaPipe face engine (runs on the student's device, not a server).
// Loads the WASM runtime + face_landmarker model from CDN, then extracts the
// same metrics our Python pipeline used: eye-aspect-ratio + head yaw/pitch.
// ===================================================================
// Types only (erased at build) — the heavy runtime is dynamically imported below
// so MediaPipe ships as its own chunk, loaded only when monitoring is enabled.
import type { FaceLandmarker as FaceLandmarkerT } from "@mediapipe/tasks-vision";

const WASM_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

// Same landmark indices as the Python eye_tracker.
const LEFT_EYE = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];

export interface FrameMetrics {
  faceCount: number;
  ear: number;
  yaw: number;
  pitch: number;
}

let landmarker: FaceLandmarkerT | null = null;
let loading: Promise<FaceLandmarkerT> | null = null;

/** Download + initialise the model once (cached by the browser afterwards). */
export async function loadFaceEngine(): Promise<FaceLandmarkerT> {
  if (landmarker) return landmarker;
  if (!loading) {
    loading = (async () => {
      const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM_CDN);
      landmarker = await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO",
        numFaces: 2, // detect a 2nd face (cheating signal)
        outputFacialTransformationMatrixes: true,
      });
      return landmarker;
    })();
  }
  return loading;
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }, w: number, h: number): number {
  const dx = (a.x - b.x) * w;
  const dy = (a.y - b.y) * h;
  return Math.hypot(dx, dy);
}

function earOf(lm: { x: number; y: number }[], idx: number[], w: number, h: number): number {
  const [p1, p2, p3, p4, p5, p6] = idx.map((i) => lm[i]);
  const v1 = dist(p2, p6, w, h);
  const v2 = dist(p3, p5, w, h);
  const horiz = dist(p1, p4, w, h);
  return horiz === 0 ? 0 : (v1 + v2) / (2 * horiz);
}

// Decompose the 4x4 facial transformation matrix (row-major) to yaw/pitch (deg).
function headAngles(data: number[]): { yaw: number; pitch: number } {
  const r00 = data[0], r10 = data[4], r20 = data[8];
  const r21 = data[9], r22 = data[10];
  const sy = Math.hypot(r00, r10);
  const pitch = Math.atan2(r21, r22);
  const yaw = Math.atan2(-r20, sy);
  const toDeg = 180 / Math.PI;
  return { yaw: yaw * toDeg, pitch: pitch * toDeg };
}

/** Analyse one video frame. Returns metrics for the primary face, or faceCount 0. */
export function analyzeFrame(video: HTMLVideoElement, timestampMs: number): FrameMetrics {
  const engine = landmarker;
  if (!engine) return { faceCount: 0, ear: 0, yaw: 0, pitch: 0 };

  const res = engine.detectForVideo(video, timestampMs);
  const faces = res.faceLandmarks ?? [];
  if (faces.length === 0) return { faceCount: 0, ear: 0, yaw: 0, pitch: 0 };

  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;
  const lm = faces[0] as { x: number; y: number }[];
  const ear = (earOf(lm, LEFT_EYE, w, h) + earOf(lm, RIGHT_EYE, w, h)) / 2;

  let yaw = 0, pitch = 0;
  const mats = res.facialTransformationMatrixes;
  if (mats && mats.length > 0) {
    const angles = headAngles(Array.from(mats[0].data));
    yaw = angles.yaw;
    pitch = angles.pitch;
  }
  return { faceCount: faces.length, ear, yaw, pitch };
}
