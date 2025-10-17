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
    if (error) setMessage(`❌ ${error.message}`);
    else {
      setMessage("✅ Saved!");
      setHeatCode("");
      setSupplier("");
      loadHeats();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* form + table (same as before) */}
    </div>
  );
}
