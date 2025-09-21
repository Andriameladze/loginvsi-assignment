import { TaskStateEnum } from '../constants/task.const';

export type TaskState =
  | TaskStateEnum.IN_QUEUE
  | TaskStateEnum.IN_PROGRESS
  | TaskStateEnum.DONE;

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
