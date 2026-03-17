export interface PlannerSettings {
  startHour: number;
  endHour: number;
  weekStartDate: string; // ISO string
  clearerGrids?: boolean;
}

export interface Block {
  id: string;
  dayOfWeek: number; // 0 (Monday) to 6 (Sunday)
  startHour: number; // e.g., 6.5 for 6:30
  endHour: number;
  title: string;
  description: string;
  color: string;
  fontFamily?: string;
  fontSize?: number;
}

export interface AppState {
  settings: PlannerSettings;
  blocks: Block[];
}
