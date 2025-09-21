import { TaskEnum } from '../constants/task.const';

export type TaskState =
  | TaskEnum.IN_QUEUE
  | TaskEnum.IN_PROGRESS
  | TaskEnum.DONE;

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
