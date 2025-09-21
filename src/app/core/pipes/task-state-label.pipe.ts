import { Pipe, PipeTransform } from '@angular/core';
import { TaskStateEnum, TASK_STATE_LABELS } from '../constants/task.const';

@Pipe({
  name: 'taskStateLabel',
  standalone: true,
})
export class TaskStateLabelPipe implements PipeTransform {
  transform(value: TaskStateEnum | null | undefined): string {
    return value ? TASK_STATE_LABELS[value] ?? value : '';
  }
}
