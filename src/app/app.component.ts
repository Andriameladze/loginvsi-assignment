import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NbLayoutModule, NbSidebarModule } from '@nebular/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NbLayoutModule, NbSidebarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'loginvsi-assignment2';
}
