import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-whatsdome',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-whatsdome.component.html',
  styleUrls: ['./dashboard-whatsdome.component.css'],
})
export class DashboardWhatsDome { }
