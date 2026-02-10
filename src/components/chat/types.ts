import type { LucideIcon } from "lucide-react";

export interface Mode {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface Model {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export interface ChatSubmitPayload {
  text: string;
  mode: Mode | null;
  model: Model;
}
