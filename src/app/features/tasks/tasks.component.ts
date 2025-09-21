import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import {
  NbButtonModule,
  NbCardModule,
  NbDialogService,
  NbSelectModule,
  NbToastrService,
} from '@nebular/theme';

import { TASK_STATES, TaskEnum } from '../../core/constants/task.const';
import { Task, TaskState } from '../../core/models/task.model';
import { TaskManagerStore } from '../../core/services/task-manager.store';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';

type TaskViewModel = Task & { assigneeName: string | null };

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, NbCardModule, NbButtonModule, NbSelectModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent {
  readonly store = inject(TaskManagerStore);
  private readonly dialogService = inject(NbDialogService);
  private readonly toastr = inject(NbToastrService);

  readonly taskStates = TASK_STATES;
  readonly users = this.store.users;

  readonly tasks = computed<TaskViewModel[]>(() => {
    const users = new Map(
      this.store.users().map((user) => [user.id, user.name])
    );

    return this.store.tasks().map((task) => ({
      ...task,
      assigneeName: task.assigneeId ? users.get(task.assigneeId) ?? null : null,
    }));
  });

  openCreateDialog(): void {
    this.dialogService.open<TaskDialogComponent>(TaskDialogComponent, {
      context: {
        mode: 'create',
        task: null,
      } as Partial<TaskDialogComponent>,
    });
  }

  openEditDialog(task: Task): void {
    this.dialogService.open<TaskDialogComponent>(TaskDialogComponent, {
      context: {
        mode: 'edit',
        task: { ...task },
      } as Partial<TaskDialogComponent>,
    });
  }

  onAssignSelected(task: Task, assigneeId: string | null): void {
    if (task.assigneeId === assigneeId) {
      return;
    }
    this.store.updateTask(task.id, { assigneeId });
    this.toastr.success('Assignment updated', 'Task updated');
  }

  onStatusSelected(task: Task, state: TaskState | null): void {
    if (!state || task.state === state) {
      return;
    }

    this.store.updateTask(task.id, { state });
    this.toastr.success('Status updated', 'Task updated');
  }

  deleteTask(task: Task): void {
    const confirmed = window.confirm(
      `Delete task "${task.name}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    this.store.deleteTask(task.id);
    this.toastr.warning('Task removed', 'Deleted');
  }

  isOptionDisabled(task: Task, userId: string): boolean {
    if (task.assigneeId === userId) {
      return false;
    }

    if (task.state !== TaskEnum.IN_PROGRESS) {
      return false;
    }

    return this.store.busyUserIds().has(userId);
  }

  isStatusOptionDisabled(task: Task, state: TaskState): boolean {
    if (state === task.state) {
      return false;
    }

    if (!task.assigneeId && state !== TaskEnum.IN_QUEUE) {
      return true;
    }

    if (state === TaskEnum.IN_PROGRESS && task.assigneeId) {
      const busyUsers = this.store.busyUserIds();
      const isBusy = busyUsers.has(task.assigneeId);
      return isBusy && task.state !== TaskEnum.IN_PROGRESS;
    }

    return false;
  }
}
