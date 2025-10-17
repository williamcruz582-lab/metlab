"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // you already have this file

type Heat = { id: number; heat_code: string };
type ChemRow = {
  id: number;
  heat_id: number;
  created_at: string;
  c?: number; mn?: number; si?: number; p?: number; s?: number;
  cr?: number; ni?: number; mo?: number; cu?: number; v?: number;
  nb?: number; ti?: number; al?: number; n?: number; b?: number; w?: number; co?: number;
  others?: string | null;
};

export default function ChemistryPage() {
  // dropdown for heats
  const [heats, setHeats] = useState<Heat[]>([]);
  const [heatId, setHeatId] = useState<number | "">("");

  // form state
  const [form, setForm] = useState<Record<string, string>>({});

  // table data
  const [rows, setRows] = useState<ChemRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // which element fields to show
  const fields = useMemo(
    () =>
      ["c","mn","si","p","s","cr","ni","mo","cu","v","nb","ti","al","n","b","w","co"] as const,
    []
  );

  // load heats for dropdown
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("heats")
        .select("id, heat_code")
        .order("created_at", { ascending: false });
      if (!error && data) setHeats(data);
    })();
  }, []);

  // load recent chemistry
  async function loadChem() {
    const { data, error } = await supabase
      .from("chemistry")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25);
    if (!error && data) setRows(data);
  }
  useEffect(() => { loadChem(); }, []);

  // helpers
  function numOrNull(v?: string) {
    if (v == null) return null;
    const t = v.trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!heatId) {
      setError("Select a Heat first.");
      return;
    }

    setLoading(true);
    const payload: any = { heat_id: heatId };

    // map numeric fields
    for (const k of fields) payload[k] = numOrNull(form[k]);
    // notes
    payload.others = form.others?.trim() || null;

    const { error } = await supabase.from("chemistry").insert(payload);
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setMessage("Saved ✅");
    setForm({});
    loadChem();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Chemistry</h1>

          {message && <div className="text-green-700 text-sm mb-3">{message}</div>}
          {error && <div className="text-red-700 text-sm mb-3">Error: {error}</div>}

          <form onSubmit={save} className="space-y-5">
            {/* Heat selector */}
            <div>
              <label className="block text-sm font-medium mb-1">Heat</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={heatId}
                onChange={(e) =>
                  setHeatId(e.target.value ? Number(e.target.value) : "")
                }
                required
              >
                <option value="">Select heat…</option>
                {heats.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.heat_code} (#{h.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Element inputs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {fields.map((k) => (
                <div key={k}>
                  <label className="block text-xs font-medium mb-1">
                    {k.toUpperCase()} (%)
                  </label>
                  <input
                    inputMode="decimal"
                    className="w-full border rounded-lg px-3 py-2"
                    value={form[k] ?? ""}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    placeholder="e.g. 0.25"
                  />
                </div>
              ))}
              <div className="md:col-span-4">
                <label className="block text-xs font-medium mb-1">Others / Notes</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={form["others"] ?? ""}
                  onChange={(e) => setForm({ ...form, others: e.target.value })}
                  placeholder="e.g., Ca 0.002; REM 0.03"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save Chemistry"}
            </button>
          </form>
        </section>

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Recent Chemistry</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Heat</th>
                  {fields.map((k) => (
                    <th key={k} className="py-2 pr-3">{k.toUpperCase()}</th>
                  ))}
                  <th className="py-2 pr-3">Others</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2 pr-3">{r.id}</td>
                    <td className="py-2 pr-3">{r.heat_id}</td>
                    {fields.map((k) => (
                      <td key={k} className="py-2 pr-3">
                        {(r as any)[k] ?? "—"}
                      </td>
                    ))}
                    <td className="py-2 pr-3">{r.others ?? "—"}</td>
                    <td className="py-2">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      className="py-6 text-center text-gray-500"
                      colSpan={fields.length + 4}
                    >
                      No chemistry rows yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

