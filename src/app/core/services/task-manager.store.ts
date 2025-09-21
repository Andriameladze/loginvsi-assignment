import { Injectable, computed, effect, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, map, of } from 'rxjs';

import { Task, TaskDraft } from '../models/task.model';
import { User, UserDraft } from '../models/user.model';

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

  readonly tasks = computed(() => this.state().tasks);
  readonly users = computed(() => this.state().users);

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
              state: 'in queue',
              updatedAt: new Date().toISOString(),
            }
          : task
      ),
    }));
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
}
