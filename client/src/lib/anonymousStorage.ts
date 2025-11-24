import type { BeangoCompletion } from "@shared/schema";

const ANONYMOUS_COMPLETIONS_KEY = "anonymous_beango_completions";
const ANONYMOUS_TASK_COMPLETIONS_KEY = "anonymous_task_completions";

export interface AnonymousTaskCompletion {
  roomCode: string;
  taskId: string;
  completedAt: string;
}

export interface AnonymousBeanGoCompletion {
  roomCode: string;
  cityId: string;
  cityName: string;
  cityImageUrl: string | null;
  participantCount: number;
  completedAt: string;
}

export function toggleTaskCompletion(roomCode: string, taskId: string, isComplete: boolean): void {
  let completions = getTaskCompletions();
  
  if (isComplete) {
    const exists = completions.some(c => c.roomCode === roomCode && c.taskId === taskId);
    if (!exists) {
      completions.push({
        roomCode,
        taskId,
        completedAt: new Date().toISOString(),
      });
    }
  } else {
    completions = completions.filter(c => !(c.roomCode === roomCode && c.taskId === taskId));
  }
  
  localStorage.setItem(ANONYMOUS_TASK_COMPLETIONS_KEY, JSON.stringify(completions));
}

export function getTaskCompletions(): AnonymousTaskCompletion[] {
  const data = localStorage.getItem(ANONYMOUS_TASK_COMPLETIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getTaskCompletionsForRoom(roomCode: string): AnonymousTaskCompletion[] {
  return getTaskCompletions().filter(c => c.roomCode === roomCode);
}

export function isTaskCompleted(roomCode: string, taskId: string): boolean {
  const completions = getTaskCompletionsForRoom(roomCode);
  return completions.some(c => c.taskId === taskId);
}

export function saveBeanGoCompletion(completion: AnonymousBeanGoCompletion): void {
  const completions = getBeanGoCompletions();
  completions.push(completion);
  localStorage.setItem(ANONYMOUS_COMPLETIONS_KEY, JSON.stringify(completions));
}

export function getBeanGoCompletions(): AnonymousBeanGoCompletion[] {
  const data = localStorage.getItem(ANONYMOUS_COMPLETIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function clearAnonymousData(): void {
  localStorage.removeItem(ANONYMOUS_COMPLETIONS_KEY);
  localStorage.removeItem(ANONYMOUS_TASK_COMPLETIONS_KEY);
}

export function getAllAnonymousData(): {
  taskCompletions: AnonymousTaskCompletion[];
  beanGoCompletions: AnonymousBeanGoCompletion[];
} {
  return {
    taskCompletions: getTaskCompletions(),
    beanGoCompletions: getBeanGoCompletions(),
  };
}
