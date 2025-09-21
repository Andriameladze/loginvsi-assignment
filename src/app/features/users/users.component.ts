import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  NbBadgeModule,
  NbButtonModule,
  NbCardModule,
  NbInputModule,
  NbListModule,
  NbToastrService,
} from '@nebular/theme';
import { Task } from '../../core/models/task.model';
import { User } from '../../core/models/user.model';
import { TaskManagerStore } from '../../core/services/task-manager.store';
import { TaskStateEnum } from '../../core/constants/task.const';
import { TaskStateLabelPipe } from '../../core/pipes/task-state-label.pipe';

interface UserViewModel extends User {
  tasks: Task[];
  inProgressTaskId: string | null;
}

@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbListModule,
    NbBadgeModule,
    TaskStateLabelPipe,
  ],
})
export class UsersComponent {
  private readonly store = inject(TaskManagerStore);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(NbToastrService);

  private readonly editingUserId = signal<string | null>(null);
  TaskStateEnum = TaskStateEnum;

  readonly userForm = this.fb.group({
    name: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(20),
    ]),
  });

  readonly users = computed<UserViewModel[]>(() => {
    const tasks = this.store.tasks();

    return this.store.users().map((user) => {
      const ownedTasks = tasks.filter((task) => task.assigneeId === user.id);
      const inProgressTask = ownedTasks.find(
        (task) => task.state === TaskStateEnum.IN_PROGRESS
      );

      return {
        ...user,
        tasks: ownedTasks,
        inProgressTaskId: inProgressTask ? inProgressTask.id : null,
      };
    });
  });

  readonly isEditing = computed(() => this.editingUserId() !== null);

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const { name } = this.userForm.getRawValue();

    if (this.isEditing()) {
      const id = this.editingUserId();
      if (!id) {
        return;
      }
      this.store.updateUser(id, { name });
      this.toastr.success('User updated successfully', 'Updated');
    } else {
      this.store.createUser({ name });
      this.toastr.success('User created successfully', 'Created');
    }
    this.resetForm();
  }

  editUser(user: User) {
    this.editingUserId.set(user.id);
    this.userForm.setValue({ name: user.name });
  }

  deleteUser(user: User) {
    const confirmed = window.confirm(
      `Delete user "${user.name}"? Their tasks will return to the queue.`
    );

    if (!confirmed) {
      return;
    }

    this.store.deleteUser(user.id);
    if (this.editingUserId() === user.id) {
      this.resetForm();
    }
    this.toastr.warning('User removed', 'Deleted');
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.editingUserId.set(null);
    this.userForm.reset({ name: '' });
  }
}
