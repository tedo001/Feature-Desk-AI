// ===================================================================
// In-browser student monitoring (runs on the web host — no local app).
// Webcam + MediaPipe + attention engine all run in THIS browser tab.
// Results are written to Supabase for the teacher dashboard.
// ===================================================================
import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { loadFaceEngine, analyzeFrame, activeDelegate } from "../../lib/cv-web/faceEngine";
import { AttentionEngine, type CvResult } from "../../lib/cv-web/attentionEngine";
import { requestWebcam, stopStream } from "../../lib/cv-web/webcam";
import { setMonitoringEnabled, pushAttention } from "../../lib/cv/cvStore";

const ANALYZE_MS = 200; // ~5 fps — smooth + plenty for attention
const PUSH_MS = 1000; // write to Supabase at most once/sec

const STATUS_COLOR: Record<string, string> = {
  Focused: "bg-green-100 text-green-700",
  Distracted: "bg-amber-100 text-amber-700",
  Sleeping: "bg-red-100 text-red-700",
  Absent: "bg-gray-100 text-gray-600",
};

export default function WebMonitoringPanel({ examId }: { examId?: string }) {
  const { user } = useAuth();
  const studentId = (user as { id?: string } | null)?.id ?? "";

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const engineRef = useRef<AttentionEngine | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastPushRef = useRef(0);

  const [enabled, setEnabled] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [result, setResult] = useState<CvResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"GPU" | "CPU" | null>(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => () => stop(), []); // cleanup on unmount

  async function start() {
    const ok = window.confirm(
      "Enable AI monitoring?\n\nThis turns on your camera in this browser, runs the " +
        "analysis on YOUR device, and shares your attention status with your teacher. " +
        "You can turn it off anytime.",
    );
    if (!ok) return;
    setError(null);
    try {
      const stream = await requestWebcam(); // triggers the camera permission prompt
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setLoadingModel(true);
      await loadFaceEngine(); // downloads model to this device (cached after)
      setMode(activeDelegate);
      setLoadingModel(false);

      engineRef.current = new AttentionEngine();
      setEnabled(true);
      if (studentId) void setMonitoringEnabled(studentId, true, examId);

      timerRef.current = window.setInterval(tick, ANALYZE_MS);
    } catch (e) {
      console.error("Monitoring start error:", e);
      setLoadingModel(false);
      setError(e instanceof Error ? e.message : "Could not start monitoring.");
      stop();
    }
  }

  function tick() {
    const video = videoRef.current;
    const engine = engineRef.current;
    if (!video || !engine || video.readyState < 2) return;
    const metrics = analyzeFrame(video, performance.now());
    const r = engine.update(performance.now(), metrics);
    setResult(r);
    const now = Date.now();
    if (studentId && now - lastPushRef.current >= PUSH_MS) {
      lastPushRef.current = now;
      void pushAttention({ student_id: studentId, exam_id: examId, ...r }).then(({ error }) =>
        setSynced(!error),
      );
    }
  }

  function stop() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    engineRef.current = null;
    setResult(null);
    setEnabled(false);
    setSynced(false);
    if (studentId) void setMonitoringEnabled(studentId, false, examId);
  }

  if (!studentId) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-800">AI Attention Monitoring</h3>
      </div>
      <p className="mt-1 text-[10px] leading-snug text-gray-500">
        Analysed locally in your browser; only your status is shared with your teacher.
      </p>

      <div className="mt-2 flex items-start gap-2.5">
        <video
          ref={videoRef}
          muted
          playsInline
          className={`h-16 w-[88px] rounded-md bg-black object-cover ${enabled ? "" : "hidden"}`}
        />
        <div className="flex-1">
          <button
            onClick={enabled ? stop : start}
            disabled={loadingModel}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white ${
              enabled ? "bg-red-500 hover:bg-red-600" : "bg-indigo-600 hover:bg-indigo-700"
            } disabled:opacity-60`}
          >
            {loadingModel ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : enabled ? (
              <CameraOff className="h-3.5 w-3.5" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
            {loadingModel ? "Loading…" : enabled ? "Disable" : "Enable monitoring"}
          </button>

          {result && (
            <div className="mt-2 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    STATUS_COLOR[result.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {result.status}
                </span>
                <span className="text-lg font-bold text-gray-800">{result.attention}%</span>
                <span className="text-[11px] text-gray-500">
                  faces {result.faces} {result.phone ? "· 📱" : ""}
                </span>
              </div>
              <div className="h-1.5 w-full max-w-[170px] overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full transition-all duration-300 ease-out ${
                    result.attention >= 80 ? "bg-green-500" : result.attention >= 50 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${result.attention}%` }}
                />
              </div>
            </div>
          )}
          {enabled && mode && (
            <p className="mt-1.5 text-[10px] text-gray-400">
              {mode === "GPU" ? "GPU (fast)" : "CPU (lite)"}
              {synced && " · ✓ shared"}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-1.5 rounded-md bg-red-50 p-2 text-[11px] text-red-700">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
