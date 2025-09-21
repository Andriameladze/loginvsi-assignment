export type TaskState = 'in queue' | 'in progress' | 'done';

export interface TaskDraft {
  name: string;
  description: string;
  state: TaskState;
  assigneeId: string | null;
}

export interface Task extends TaskDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
}
