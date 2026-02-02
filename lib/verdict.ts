export type DayType = "gym" | "voley" | "doble" | "descanso";
export type ProteinLevel = "baja" | "media" | "alta";
export type CarbLevel = "bajo" | "medio" | "alto";
export type Quality = "real" | "mixta" | "procesado";

export function getVerdict(
  dayType: DayType,
  proteinLevel: ProteinLevel,
  quality: Quality
): "ACERCA" | "MANTIENE" | "FRENA" {
  const activeDay = dayType === "gym" || dayType === "voley" || dayType === "doble";

  if (activeDay) {
    if (proteinLevel === "baja") {
      return "FRENA";
    }
    if (proteinLevel === "media") {
      return "MANTIENE";
    }
    if (proteinLevel === "alta" && (quality === "real" || quality === "mixta")) {
      return "ACERCA";
    }
    return "MANTIENE";
  }

  if (proteinLevel === "alta" && quality === "real") {
    return "ACERCA";
  }
  if (proteinLevel === "media") {
    return "MANTIENE";
  }
  return "FRENA";
}
