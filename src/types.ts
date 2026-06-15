export type DrillCategory = "tiro" | "bote" | "agilidad" | "resistencia" | "finalizaciones";

export interface Drill {
  id: string;
  title: string;
  category: DrillCategory;
  description: string;
  durationMinutes: number;
  intensity: "Baja" | "Media" | "Alta";
  targetReps: string;
  assignedObjective: string;
}

export interface TrainingDay {
  dayName: string;
  theme: string;
  drills: Drill[];
}

export interface TrainingWeek {
  weekName: string;
  theme: string;
  days: TrainingDay[];
}

export interface TrainingPlan {
  title: string;
  description: string;
  recommendedWeeklyHours: number;
  weeks: TrainingWeek[];
}

export interface CompletedDrill {
  id: string;
  dayName: string;
  drillId: string;
  drillTitle: string;
  category: DrillCategory;
  points: number;
  completedAt: string;
  offline: boolean;
}

export interface LeaderboardPlayer {
  id: string;
  name: string;
  avatar: string;
  points: number;
  drillsCompleted: number;
  lastActive: string;
}

export interface CustomObjective {
  id: string;
  playerTarget: string;
  description: string;
  category: DrillCategory;
  badge: string;
  assignedBy: string;
  targetCount: number;
  currentCount: number;
  deadline: string;
}

export interface NotificationLog {
  id: string;
  title: string;
  body: string;
  timestamp: string;
}


