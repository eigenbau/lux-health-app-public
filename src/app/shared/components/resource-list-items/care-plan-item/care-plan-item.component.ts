import { Component, Input } from '@angular/core';
import { ICarePlan } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICarePlan';
import { DistanceToNowPipe } from '@pipes/distance-to-now/distance-to-now.pipe';
import { CarePlanTitlePipe } from '@pipes/care-plan-title/care-plan-title.pipe';
import { NgIf, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExpandableDirective } from '@directives/expandable/expandable.directive';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-care-plan-item',
  templateUrl: './care-plan-item.component.html',
  standalone: true,
  imports: [
    IonicModule,
    ExpandableDirective,
    RouterLink,
    NgIf,
    TitleCasePipe,
    CarePlanTitlePipe,
    DistanceToNowPipe,
  ],
})
export class CarePlanItemComponent {
  @Input({ required: true }) carePlan!: ICarePlan;
  @Input() lines: 'none' | 'inset' | 'full' = 'inset';
  @Input({ required: true }) link!: string[];
  @Input() detail: boolean = false;
}
