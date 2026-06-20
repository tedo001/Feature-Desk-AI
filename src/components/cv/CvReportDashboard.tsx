// ===================================================================
// CV Analysis Report — teacher view of live attention monitoring.
// Reads cv_attention from Supabase (written by students' in-browser CV).
// New, self-contained component; does not modify existing code.
// ===================================================================
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Activity, RefreshCw, Eye, AlertTriangle, Users, Smartphone } from "lucide-react";
import {
  getLatestPerStudent,
  getStudentNames,
  subscribeAttention,
  type CvAttention,
} from "../../lib/cv/cvStore";

const STATUS_STYLE: Record<string, string> = {
  Focused: "bg-green-100 text-green-700",
  Distracted: "bg-amber-100 text-amber-700",
  Sleeping: "bg-red-100 text-red-700",
  Absent: "bg-gray-100 text-gray-600",
};

function timeAgo(iso?: string): string {
  if (!iso) return "—";
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 3) return "just now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

// Demo data shown until real students start monitoring (same pattern as the
// other teacher tabs). Replaced automatically the moment real rows arrive.
const nowIso = (sAgo: number) => new Date(Date.now() - sAgo * 1000).toISOString();
const MOCK_NAMES: Record<string, string> = {
  "demo-1": "Alice Johnson", "demo-2": "Bob Smith", "demo-3": "Charlie Brown",
  "demo-4": "Diana Ross", "demo-5": "Ethan Hunt", "demo-6": "Fiona Glen", "demo-7": "George Hall",
};
const MOCK_CV: CvAttention[] = [
  { student_id: "demo-1", status: "Focused", attention: 92, phone: false, faces: 1, created_at: nowIso(3) },
  { student_id: "demo-4", status: "Focused", attention: 84, phone: false, faces: 1, created_at: nowIso(5) },
  { student_id: "demo-7", status: "Distracted", attention: 58, phone: false, faces: 2, created_at: nowIso(8) },
  { student_id: "demo-2", status: "Distracted", attention: 46, phone: false, faces: 1, created_at: nowIso(4) },
  { student_id: "demo-5", status: "Distracted", attention: 33, phone: true, faces: 1, created_at: nowIso(6) },
  { student_id: "demo-3", status: "Sleeping", attention: 7, phone: false, faces: 1, created_at: nowIso(12) },
  { student_id: "demo-6", status: "Absent", attention: 0, phone: false, faces: 0, created_at: nowIso(20) },
];

export default function CvReportDashboard() {
  const [rows, setRows] = useState<Record<string, CvAttention>>({});
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState<CvAttention[]>(MOCK_CV);

  async function load() {
    setLoading(true);
    const latest = await getLatestPerStudent();
    const map: Record<string, CvAttention> = {};
    latest.forEach((r) => (map[r.student_id] = r));
    setRows(map);
    setNames(await getStudentNames(latest.map((r) => r.student_id)));
    setLoading(false);
  }

  useEffect(() => {
    load();
    const unsub = subscribeAttention((row) => {
      setRows((prev) => ({ ...prev, [row.student_id]: row }));
    });
    return unsub;
  }, []);

  // Animate the demo data so it feels like a live feed (until real data arrives).
  useEffect(() => {
    const empty = Object.keys(rows).length === 0;
    if (!empty) return;
    const id = setInterval(() => {
      setDemo((prev) =>
        prev.map((r) => {
          const created_at = new Date().toISOString();
          if (r.faces === 0) return { ...r, created_at }; // absent stays absent
          const delta = Math.round((Math.random() - 0.45) * 12);
          const attention = Math.max(2, Math.min(100, r.attention + delta));
          const status =
            attention >= 70 ? "Focused" : attention >= 30 ? "Distracted" : "Sleeping";
          return { ...r, attention, status, created_at };
        }),
      );
    }, 1500);
    return () => clearInterval(id);
  }, [rows]);

  const realList = useMemo(() => Object.values(rows), [rows]);
  const isDemo = realList.length === 0;
  const view = isDemo ? demo : realList;
  const viewNames = isDemo ? MOCK_NAMES : names;
  const stats = useMemo(() => {
    const total = view.length;
    const avg = total ? Math.round(view.reduce((s, r) => s + r.attention, 0) / total) : 0;
    const count = (st: string) => view.filter((r) => r.status === st).length;
    const phone = view.filter((r) => r.phone).length;
    const multi = view.filter((r) => r.faces > 1).length;
    return { total, avg, focused: count("Focused"), distracted: count("Distracted"),
      sleeping: count("Sleeping"), absent: count("Absent"), alerts: phone + multi, phone, multi };
  }, [view]);

  const Stat = ({ icon, label, value, color }: { icon: ReactNode; label: string; value: number | string; color: string }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>{icon}</div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" /> CV Analysis Report
            {isDemo && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                Demo data
              </span>
            )}
          </h2>
          <p className="flex items-center gap-2 text-gray-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Live attention monitoring from students' devices
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={<Users className="w-6 h-6 text-blue-600" />} label="Monitored" value={stats.total} color="bg-blue-50" />
        <Stat icon={<Eye className="w-6 h-6 text-indigo-600" />} label="Avg Attention" value={`${stats.avg}%`} color="bg-indigo-50" />
        <Stat icon={<Activity className="w-6 h-6 text-green-600" />} label="Focused" value={stats.focused} color="bg-green-50" />
        <Stat icon={<AlertTriangle className="w-6 h-6 text-red-600" />} label="Alerts" value={stats.alerts} color="bg-red-50" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-400">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Student</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Attention</th>
                <th className="text-left px-5 py-3 font-medium">Faces</th>
                <th className="text-left px-5 py-3 font-medium">Phone</th>
                <th className="text-left px-5 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {[...view]
                .sort((a, b) => a.attention - b.attention)
                .map((r) => (
                  <tr key={r.student_id} className="border-t border-gray-100">
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {viewNames[r.student_id] ?? r.student_id}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className={`h-full ${r.attention >= 80 ? "bg-green-500" : r.attention >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${r.attention}%` }}
                          />
                        </div>
                        <span className="text-gray-700">{r.attention}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{r.faces}</td>
                    <td className="px-5 py-3">
                      {r.phone ? (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <Smartphone className="w-4 h-4" /> yes
                        </span>
                      ) : (
                        <span className="text-gray-400">no</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{timeAgo(r.created_at)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
