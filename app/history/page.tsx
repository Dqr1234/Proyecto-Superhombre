"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getVerdict, DayType, ProteinLevel, Quality } from "@/lib/verdict";

interface HistoryEntry {
  id: number;
  photo_url: string;
  protein_level: ProteinLevel;
  carb_level: string;
  quality: Quality;
  day: {
    date: string;
    day_type: DayType;
  };
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from("meals")
        .select(
          "id, photo_url, protein_level, carb_level, quality, day:days(date, day_type)"
        )
        .order("id", { ascending: false });

      if (!error && data) {
        setEntries(data as HistoryEntry[]);
      }
      setLoading(false);
    };

    fetchEntries();
  }, []);

  return (
    <section className="card">
      <h2>Historial</h2>
      <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
        Tus últimas evaluaciones de cena.
      </p>
      {loading ? (
        <p style={{ marginTop: "1rem" }}>Cargando...</p>
      ) : entries.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>Aún no hay registros.</p>
      ) : (
        <div style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
          {entries.map((entry) => {
            const verdict = getVerdict(
              entry.day.day_type,
              entry.protein_level,
              entry.quality
            );
            return (
              <div key={entry.id} className="history-item">
                <img src={entry.photo_url} alt="Cena" />
                <div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span className="badge">{entry.day.date}</span>
                    <span className="badge">{entry.day.day_type}</span>
                    <span className="badge">{verdict}</span>
                  </div>
                  <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
                    Proteína {entry.protein_level} · Calidad {entry.quality}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
