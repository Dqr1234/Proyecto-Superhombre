"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  getVerdict,
  DayType,
  ProteinLevel,
  CarbLevel,
  Quality
} from "@/lib/verdict";

const dayTypes: DayType[] = ["gym", "voley", "doble", "descanso"];
const proteinLevels: ProteinLevel[] = ["baja", "media", "alta"];
const carbLevels: CarbLevel[] = ["bajo", "medio", "alto"];
const qualities: Quality[] = ["real", "mixta", "procesado"];

export default function HomePage() {
  const [dayType, setDayType] = useState<DayType>("gym");
  const [proteinLevel, setProteinLevel] = useState<ProteinLevel>("media");
  const [carbLevel, setCarbLevel] = useState<CarbLevel>("medio");
  const [quality, setQuality] = useState<Quality>("real");
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const verdict = useMemo(
    () => getVerdict(dayType, proteinLevel, quality),
    [dayType, proteinLevel, quality]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      if (!photo) {
        setMessage("Por favor sube una foto de tu cena.");
        setSubmitting(false);
        return;
      }

      const today = new Date();
      const date = today.toISOString().split("T")[0];
      const filePath = `${date}/${Date.now()}-${photo.name}`;

      const { error: uploadError } = await supabase.storage
        .from("meal_photos")
        .upload(filePath, photo, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrl } = supabase.storage
        .from("meal_photos")
        .getPublicUrl(filePath);

      const { data: dayData, error: dayError } = await supabase
        .from("days")
        .upsert(
          {
            date,
            day_type: dayType,
            sleep_hours: null,
            notes: null
          },
          { onConflict: "date" }
        )
        .select()
        .single();

      if (dayError) {
        throw dayError;
      }

      const { error: mealError } = await supabase.from("meals").insert({
        day_id: dayData.id,
        photo_url: publicUrl.publicUrl,
        protein_level: proteinLevel,
        carb_level: carbLevel,
        quality
      });

      if (mealError) {
        throw mealError;
      }

      setMessage(`Registro guardado. Veredicto: ${verdict}`);
      setPhoto(null);
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Error inesperado";
      setMessage(messageText);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid">
      <section className="card">
        <h2>Registrar cena</h2>
        <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
          Evalúa tu día y toma mejores decisiones nutricionales.
        </p>
        <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
          <div>
            <label>Tipo de día</label>
            <select value={dayType} onChange={(e) => setDayType(e.target.value as DayType)}>
              {dayTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Foto de la cena</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            />
          </div>
          <div>
            <label>Nivel de proteína</label>
            <select
              value={proteinLevel}
              onChange={(e) => setProteinLevel(e.target.value as ProteinLevel)}
            >
              {proteinLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Nivel de carbohidratos</label>
            <select value={carbLevel} onChange={(e) => setCarbLevel(e.target.value as CarbLevel)}>
              {carbLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Calidad</label>
            <select value={quality} onChange={(e) => setQuality(e.target.value as Quality)}>
              {qualities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar cena"}
          </button>
        </form>
        {message ? (
          <p style={{ marginTop: "1rem", color: "var(--accent)" }}>{message}</p>
        ) : null}
      </section>

      <section className="card">
        <h2>Veredicto automático</h2>
        <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
          Basado en tu tipo de día y calidad de la cena.
        </p>
        <div style={{ marginTop: "1.5rem" }}>
          <span className="badge">{dayType}</span>
        </div>
        <div className="verdict" style={{ marginTop: "1rem" }}>
          {verdict}
        </div>
        <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
          Proteína: {proteinLevel} · Calidad: {quality}
        </p>
      </section>
    </div>
  );
}
