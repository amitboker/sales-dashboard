import { useEffect, useMemo, useState } from "react";
import { funnelStages as defaultStages } from "../data/mockData.js";

const STORAGE_KEY = "funnelStages";

const ensureStage = (stage, index) => ({
  id: stage.id || `stage-${index}-${String(stage.label || "stage").replace(/\s+/g, "-")}`,
  label: stage.label || "שלב חדש",
  value: Number.isFinite(stage.value) ? stage.value : 0,
  percent: stage.percent || "0%",
  conversionRate: stage.conversionRate ?? null,
  conversionDirection: stage.conversionDirection ?? null,
  dropped: stage.dropped ?? null,
  droppedPercent: stage.droppedPercent ?? null,
  insight: stage.insight ?? null,
  iconType: stage.iconType || "people",
  critical: Boolean(stage.critical),
  active: stage.active !== false,
});

const normalizeStages = (stages) =>
  (Array.isArray(stages) ? stages : []).map(ensureStage);

export default function useFunnelStages() {
  const [stages, setStages] = useState(() => {
    if (typeof window === "undefined") {
      return normalizeStages(defaultStages);
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return normalizeStages(defaultStages);
      const parsed = JSON.parse(raw);
      const normalized = normalizeStages(parsed);
      return normalized.length ? normalized : normalizeStages(defaultStages);
    } catch (err) {
      return normalizeStages(defaultStages);
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stages));
    } catch (err) {
      // ignore storage errors
    }
  }, [stages]);

  const activeStages = useMemo(
    () => stages.filter((stage) => stage.active !== false),
    [stages]
  );

  return { stages, setStages, activeStages };
}
