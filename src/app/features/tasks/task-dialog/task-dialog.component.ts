import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  NbButtonModule,
  NbCardModule,
  NbDialogRef,
  NbInputModule,
  NbSelectModule,
  NbToastrService,
} from '@nebular/theme';

import { TASK_STATES, TaskEnum } from '../../../core/constants/task.const';
import { Task, TaskDraft, TaskState } from '../../../core/models/task.model';
import { TaskManagerStore } from '../../../core/services/task-manager.store';

@Component({
  standalone: true,
  selector: 'app-task-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbInputModule,
    NbSelectModule,
    NbButtonModule,
  ],
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.scss',
})
export class TaskDialogComponent implements OnInit {
  readonly store = inject(TaskManagerStore);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(NbToastrService);
  private readonly dialogRef = inject(NbDialogRef<TaskDialogComponent>);

  TaskEnum = TaskEnum;

  mode: 'create' | 'edit' = 'create';
  task: Task | null = null;

  readonly taskStates = TASK_STATES;
  readonly users = this.store.users;

  readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(80),
    ]),
    description: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(500),
    ]),
    assigneeId: this.fb.control<string | null>(null),
    state: this.fb.nonNullable.control<TaskState>(TaskEnum.IN_QUEUE, [
      Validators.required,
    ]),
  });

  get isEditMode(): boolean {
    return this.mode === 'edit' && !!this.task;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Edit Task' : 'Create Task';
  }

  ngOnInit(): void {
    const task = this.task;
    if (task) {
      this.form.setValue({
        name: task.name,
        description: task.description,
        assigneeId: task.assigneeId,
        state: task.state,
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    try {
      if (this.isEditMode && this.task) {
        this.store.updateTask(this.task.id, formValue as Partial<TaskDraft>);
        this.toastr.success('Task updated successfully', 'Updated');
      } else {
        this.store.createTask(formValue as TaskDraft);
        this.toastr.success('Task created successfully', 'Created');
      }
      this.dialogRef.close(true);
    } catch (error) {
      this.toastr.danger(
        error instanceof Error ? error.message : String(error),
        'Error'
      );
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  onAssigneeChange(value: string | null): void {
    const resolvedValue = value === 'null' ? null : value;
    this.form.patchValue({ assigneeId: resolvedValue });

    if (!resolvedValue) {
      this.form.patchValue({ state: TaskEnum.IN_QUEUE });
    }
  }

  isOptionDisabled(userId: string): boolean {
    if (this.form.controls.state.value !== TaskEnum.IN_PROGRESS) {
      return false;
    }

    if (this.task?.assigneeId === userId) {
      return false;
    }
    return this.store.busyUserIds().has(userId);
  }
}
