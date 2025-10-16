"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Heat = {
  id: number;
  heat_code: string;
  supplier: string | null;
  created_at: string;
};

export default function HeatsPage() {
  const [heatCode, setHeatCode] = useState("");
  const [supplier, setSupplier] = useState("");
  const [loading, setLoading] = useState(false);
  const [heats, setHeats] = useState<Heat[]>([]);
  const [message, setMessage] = useState("");

  async function loadHeats() {
    const { data, error } = await supabase
      .from("heats")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setHeats(data);
  }

  useEffect(() => {
    loadHeats();
  }, []);

  async function addHeat(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("heats").insert({
      heat_code: heatCode.trim(),
      supplier: supplier.trim() || null,
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Saved!");
      setHeatCode("");
      setSupplier("");
      loadHeats();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Heats</h1>

          <form onSubmit={addHeat} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Heat Code</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={heatCode}
                onChange={(e) => setHeatCode(e.target.value)}
                placeholder="e.g., 240729-01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Supplier (optional)</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="ABC Steel"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Heat"}
            </button>

            {message && <p className="text-sm mt-2">{message}</p>}
          </form>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Recent Heats</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Heat Code</th>
                  <th className="py-2 pr-4">Supplier</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {heats.map((h) => (
                  <tr key={h.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 pr-4">{h.id}</td>
                    <td className="py-2 pr-4 font-medium">{h.heat_code}</td>
                    <td className="py-2 pr-4">{h.supplier ?? "—"}</td>
                    <td className="py-2">{new Date(h.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {heats.length === 0 && (
                  <tr>
                    <td className="py-4" colSpan={4}>No heats yet. Add one above.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
