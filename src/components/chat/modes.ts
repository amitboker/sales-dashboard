import {
  BarChart3,
  FileText,
  Timer,
  TrendingUp,
  Users,
  CircleDot,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import type { Mode, Model } from "./types";

export const MODES: Mode[] = [
  { id: "dashboard", label: "דשבורד", icon: BarChart3 },
  { id: "reports", label: "דוחות", icon: FileText },
  { id: "analysis", label: "ניתוח", icon: Timer },
  { id: "forecasts", label: "תחזיות", icon: TrendingUp },
  { id: "team", label: "צוות", icon: Users },
  { id: "funnel", label: "משפך", icon: CircleDot },
  { id: "research", label: "מחקר", icon: Search },
];

export const MODELS: Model[] = [
  { id: "clario-pro", label: "Clario Pro", icon: Sparkles, description: "מודל מתקדם" },
  { id: "claude-opus", label: "Claude Opus 4.6", icon: Zap, description: "Anthropic" },
];

export const SUGGESTION_CARDS = [
  "הצג לי הכנסות חודשיות",
  "איזה נציג סגר הכי הרבה?",
  "בנה דוח המרות",
  "נתח את משפך המכירות",
];
