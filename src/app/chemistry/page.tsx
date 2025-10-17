"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ChemistryPage() {
  const [chemistry, setChemistry] = useState<any[]>([]);
  const [heatCode, setHeatCode] = useState("");
  const [carbon, setCarbon] = useState("");
  const [chrome, setChrome] = useState("");

  // Load chemistry records on page load
  useEffect(() => {
    fetchChemistry();
  }, []);

  async function fetchChemistry() {
    const { data, error } = await supabase
      .from("chemistry")       // 👈 table name in Supabase
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setChemistry(data);
  }

  async function addChemistry() {
    const { error } = await supabase.from("chemistry").insert([
      {
        heat_code: heatCode,
        carbon: carbon,
        chrome: chrome,
      },
    ]);

    if (!error) {
      setHeatCode("");
      setCarbon("");
      setChrome("");
      fetchChemistry();
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Chemistry</h1>

      <input
        placeholder="Heat Code"
        value={heatCode}
        onChange={(e) => setHeatCode(e.target.value)}
      />
      <input
        placeholder="Carbon %"
        value={carbon}
        onChange={(e) => setCarbon(e.target.value)}
      />
      <input
        placeholder="Chrome %"
        value={chrome}
        onChange={(e) => setChrome(e.target.value)}
      />

      <button onClick={addChemistry}>Add Record</button>

      <table>
        <thead>
          <tr>
            <th>Heat Code</th>
            <th>Carbon</th>
            <th>Chrome</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {chemistry.map((row) => (
            <tr key={row.id}>
              <td>{row.heat_code}</td>
              <td>{row.carbon}</td>
              <td>{row.chrome}</td>
              <td>{new Date(row.created_at).toLocaleString()}</td>
            </tr>

