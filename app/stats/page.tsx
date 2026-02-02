"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getVerdict, DayType, ProteinLevel, Quality } from "@/lib/verdict";

interface StatEntry {
  id: number;
  protein_level: ProteinLevel;
  quality: Quality;
  day: {
    date: string;
    day_type: DayType;
  };
}

export default function StatsPage() {
  const [entries, setEntries] = useState<StatEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from("meals")
        .select("id, protein_level, quality, day:days(date, day_type)")
        .order("id", { ascending: false });

      if (!error && data) {
        setEntries(data as StatEntry[]);
      }
      setLoading(false);
    };

    fetchEntries();
  }, []);

  const stats = useMemo(() => {
    if (entries.length === 0) {
      return { percentage: 0, streak: 0 };
    }

    const verdicts = entries.map((entry) => ({
      date: entry.day.date,
      verdict: getVerdict(entry.day.day_type, entry.protein_level, entry.quality)
    }));

    const total = verdicts.length;
    const acercaCount = verdicts.filter((item) => item.verdict === "ACERCA").length;
    const percentage = Math.round((acercaCount / total) * 100);

    const sorted = [...verdicts].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    for (const item of sorted) {
      if (item.verdict === "ACERCA") {
        streak += 1;
      } else {
        break;
      }
    }

    return { percentage, streak };
  }, [entries]);

  return (
    <section className="card">
      <h2>Estadísticas</h2>
      <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
        Tu constancia con cenas que te acercan.
      </p>
      {loading ? (
        <p style={{ marginTop: "1rem" }}>Cargando...</p>
      ) : (
        <div style={{ marginTop: "1.5rem", display: "grid", gap: "1rem" }}>
          <div className="card" style={{ marginBottom: 0 }}>
            <h3>Porcentaje ACERCA</h3>
            <p style={{ fontSize: "2rem", marginTop: "0.5rem" }}>{stats.percentage}%</p>
          </div>
          <div className="card" style={{ marginBottom: 0 }}>
            <h3>Racha actual</h3>
            <p style={{ fontSize: "2rem", marginTop: "0.5rem" }}>{stats.streak} días</p>
          </div>
        </div>
      )}
    </section>
  );
}
