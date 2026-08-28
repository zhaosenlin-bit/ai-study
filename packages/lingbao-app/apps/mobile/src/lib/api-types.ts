export interface DiagnosisItem {
  id: string;
  subject: "chinese" | "math" | "english";
  question: string;
  options: string[];
  correctIndex: number;
  grade: number;
  difficulty: 1 | 2 | 3;
}

export interface DiagnosisReport {
  childId: string;
  overall: { level: "A" | "B" | "C" | "D"; score: number };
  perSubject: Record<string, { level: "A" | "B" | "C" | "D"; strongTopics: string[]; weakTopics: string[] }>;
}

export interface PlanTask {
  id: string;
  subject: string;
  topic: string;
  type: "explain" | "practice" | "review";
  duration: number;
  done: boolean;
}

export interface Plan {
  id: string;
  childId: string;
  date: string;
  tasks: PlanTask[];
  petEncouragement?: string;
}
