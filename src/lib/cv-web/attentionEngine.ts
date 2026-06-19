// ===================================================================
// TypeScript port of the Python AttentionEngine — identical behaviour:
//  - a blink (closed < 7s) NEVER reduces attention
//  - >7s closed -> Distracted, >12s -> "no attention", >20s -> Sleeping
//  - head-motion (yaw/pitch std) lowers attention; EMA smoothing
//  - no face -> Absent
// Runs in the browser; same tuned thresholds as the tested service.
// ===================================================================
import type { FrameMetrics } from "./faceEngine";

const BLINK_EAR = 0.21;
const DROWSY_S = 7;
const INATTENTIVE_S = 12;
const SLEEP_S = 20;
const WINDOW_S = 4;
const EMA_ALPHA = 0.3;
const HEAD_MOTION_REF = 12;
const FOCUS_THRESHOLD = 60;

export type CvStatus = "Focused" | "Distracted" | "Sleeping" | "Absent";

export interface CvResult {
  status: CvStatus;
  attention: number;
  phone: boolean;
  faces: number;
}

interface Sample {
  ts: number;
  closed: boolean;
  yaw: number;
  pitch: number;
}

function std(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function spatialScore(yaw: number, pitch: number): number {
  let s = 100;
  s -= Math.min(Math.abs(yaw) / 45, 1) * 30;
  s -= Math.min(Math.abs(pitch) / 30, 1) * 20;
  return Math.max(0, Math.min(100, s));
}

export class AttentionEngine {
  private window: Sample[] = [];
  private ema: number | null = null;
  private closedSince: number | null = null;

  update(timestampMs: number, m: FrameMetrics): CvResult {
    const ts = timestampMs / 1000;

    if (m.faceCount === 0) {
      this.window = [];
      this.ema = null;
      this.closedSince = null;
      return { status: "Absent", attention: 0, phone: false, faces: 0 };
    }

    const closed = m.ear < BLINK_EAR;
    const spatial = spatialScore(m.yaw, m.pitch);

    this.window.push({ ts, closed, yaw: m.yaw, pitch: m.pitch });
    const cutoff = ts - WINDOW_S;
    while (this.window.length && this.window[0].ts < cutoff) this.window.shift();
    const headMotion = std(this.window.map((s) => s.yaw)) + std(this.window.map((s) => s.pitch));

    // continuous eye-closure duration
    let closedFor = 0;
    if (closed) {
      if (this.closedSince === null) this.closedSince = ts;
      closedFor = ts - this.closedSince;
    } else {
      this.closedSince = null;
    }

    // a normal blink / short rest must not move the score
    if (closed && closedFor < DROWSY_S) {
      const att = this.ema ?? spatial;
      this.ema = att;
      return {
        status: att >= FOCUS_THRESHOLD ? "Focused" : "Distracted",
        attention: Math.round(att),
        phone: false,
        faces: m.faceCount,
      };
    }

    const motionFactor = Math.max(0, 1 - headMotion / HEAD_MOTION_REF);
    const raw = spatial * (0.5 + 0.5 * motionFactor);
    this.ema = this.ema === null ? raw : EMA_ALPHA * raw + (1 - EMA_ALPHA) * this.ema;
    const attention = this.ema;

    if (closedFor >= SLEEP_S)
      return { status: "Sleeping", attention: 0, phone: false, faces: m.faceCount };
    if (closedFor >= INATTENTIVE_S)
      return { status: "Distracted", attention: Math.round(Math.min(attention, 10)), phone: false, faces: m.faceCount };
    if (closedFor >= DROWSY_S)
      return { status: "Distracted", attention: Math.round(Math.min(attention, 45)), phone: false, faces: m.faceCount };

    return {
      status: attention >= FOCUS_THRESHOLD ? "Focused" : "Distracted",
      attention: Math.round(attention),
      phone: false,
      faces: m.faceCount,
    };
  }
}
