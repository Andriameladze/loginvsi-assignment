import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NbLayoutModule, NbSidebarModule } from '@nebular/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NbLayoutModule, NbSidebarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Login VSI - Task Manager';
}
