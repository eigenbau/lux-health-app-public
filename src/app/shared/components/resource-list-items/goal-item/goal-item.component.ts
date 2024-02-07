import { Component, Input } from '@angular/core';
import { IGoal } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IGoal';
import { NgIf, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExpandableDirective } from '@directives/expandable/expandable.directive';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-goal-item',
  templateUrl: './goal-item.component.html',
  standalone: true,
  imports: [IonicModule, ExpandableDirective, RouterLink, NgIf, TitleCasePipe],
})
export class GoalItemComponent {
  @Input({ required: true }) goal!: IGoal;
  @Input() lines: 'none' | 'inset' | 'full' = 'inset';
  @Input({ required: true }) link!: string[];
  @Input() detail: boolean = false;
}
