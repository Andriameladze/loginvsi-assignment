import { TaskState } from '../models/task.model';

export enum TaskEnum {
  IN_QUEUE = 'in queue',
  IN_PROGRESS = 'in progress',
  DONE = 'done',
}

export const TASK_STATES: TaskState[] = [
  TaskEnum.IN_QUEUE,
  TaskEnum.IN_PROGRESS,
  TaskEnum.DONE,
];
