import { TaskState } from '../models/task.model';

export enum TaskStateEnum {
  IN_QUEUE = 'in-queue',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
}

export const TASK_STATE_LABELS: Record<TaskStateEnum, string> = {
  [TaskStateEnum.IN_QUEUE]: 'In Queue',
  [TaskStateEnum.IN_PROGRESS]: 'In Progress',
  [TaskStateEnum.DONE]: 'Done',
};

export const TASK_STATES: TaskState[] = [
  TaskStateEnum.IN_QUEUE,
  TaskStateEnum.IN_PROGRESS,
  TaskStateEnum.DONE,
];
