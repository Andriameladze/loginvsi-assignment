import { Injectable, computed, effect, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, map, of } from 'rxjs';

import { Task, TaskDraft } from '../models/task.model';
import { User, UserDraft } from '../models/user.model';
import { TaskEnum } from '../constants/task.const';

interface TaskManagerState {
  tasks: Task[];
  users: User[];
}

const STORAGE_KEY = 'task-manager-state';

type TaskUpdate = Partial<TaskDraft>;

type StateMutation = (state: TaskManagerState) => TaskManagerState;

@Injectable({ providedIn: 'root' })
export class TaskManagerStore {
  private readonly state = signal<TaskManagerState>(this.loadInitialState());

  TaskEnum = TaskEnum;

  readonly tasks = computed(() => this.state().tasks);
  readonly users = computed(() => this.state().users);

  readonly busyUserIds = computed(
    () =>
      new Set(
        this.tasks()
          .filter(
            (task) => task.state === TaskEnum.IN_PROGRESS && task.assigneeId
          )
          .map((task) => task.assigneeId as string)
      )
  );

  // readonly tasks$ = toObservable(this.tasks);
  // readonly users$ = toObservable(this.users);

  // readonly tasksWithAssignees$ = combineLatest([this.tasks$, this.users$]).pipe(
  //   map(([tasks, users]) =>
  //     tasks.map((task) => ({
  //       ...task,
  //       assigneeName:
  //         users.find((user) => user.id === task.assigneeId)?.name ?? null,
  //     }))
  //   )
  // );

  constructor() {
    effect(() => {
      const current = this.state();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    });
  }

  createUser(draft: UserDraft) {
    const user: User = {
      id: crypto.randomUUID(),
      ...draft,
    };

    this.patchState((state) => {
      console.log(state);
      return {
        ...state,
        users: [...state.users, user],
      };
    });
  }

  updateUser(id: string, draft: UserDraft) {
    this.patchState((state) => ({
      ...state,
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...draft } : user
      ),
    }));
  }

  deleteUser(id: string) {
    this.patchState((state) => ({
      users: state.users.filter((user) => user.id !== id),
      tasks: state.tasks.map((task) =>
        task.assigneeId === id
          ? {
              ...task,
              assigneeId: null,
              state: TaskEnum.IN_QUEUE,
              updatedAt: new Date().toISOString(),
            }
          : task
      ),
    }));
  }

  createTask(draft: TaskDraft) {
    const task = this.plainTask(draft);
    this.patchState((state) => ({
      ...state,
      tasks: [...state.tasks, task],
    }));
  }

  updateTask(id: string, changes: TaskUpdate) {
    this.patchState((state) => {
      const existing = state.tasks.find((task) => task.id === id);
      if (!existing) {
        return state;
      }

      const desiredAssignee =
        changes.assigneeId !== undefined
          ? changes.assigneeId
          : existing.assigneeId;
      const desiredState = changes.state ?? existing.state;

      const nextTask: Task = {
        ...existing,
        ...changes,
        assigneeId: desiredAssignee,
        state: desiredAssignee ? desiredState : TaskEnum.IN_QUEUE,
        updatedAt: new Date().toISOString(),
      };

      this.assertTaskRules(nextTask, existing);

      return {
        ...state,
        tasks: state.tasks.map((task) => (task.id === id ? nextTask : task)),
      };
    });
  }

  deleteTask(id: string) {
    this.patchState((state) => ({
      ...state,
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  }

  private assertTaskRules(candidate: Task, previous?: Task) {
    if (!candidate.assigneeId && candidate.state !== TaskEnum.IN_QUEUE) {
      throw new Error('Unassigned tasks must stay in the "in queue" state.');
    }

    if (!candidate.assigneeId || candidate.state !== TaskEnum.IN_PROGRESS) {
      return;
    }

    const conflictingTask = this.state().tasks.find(
      (task) =>
        task.assigneeId === candidate.assigneeId &&
        task.id !== candidate.id &&
        task.state === TaskEnum.IN_PROGRESS
    );

    if (conflictingTask) {
      throw new Error('The selected user already has a task in progress.');
    }
  }

  private patchState(mutator: StateMutation) {
    this.state.update((current) => mutator(this.cloneState(current)));
  }

  private cloneState(state: TaskManagerState): TaskManagerState {
    return {
      users: state.users.map((user) => ({ ...user })),
      tasks: state.tasks.map((task) => ({ ...task })),
    };
  }

  private loadInitialState(): TaskManagerState {
    const initialData = localStorage.getItem(STORAGE_KEY);
    if (!initialData) {
      return { users: [], tasks: [] };
    }

    const parsed = JSON.parse(initialData) as TaskManagerState;

    return {
      users: parsed.users.map((user) => ({ ...user })),
      tasks: parsed.tasks.map((task) => ({ ...task })),
    };
  }

  private plainTask(draft: TaskDraft): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      name: draft.name,
      description: draft.description,
      state: TaskEnum.IN_QUEUE,
      assigneeId: draft.assigneeId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return task;
  }
}
