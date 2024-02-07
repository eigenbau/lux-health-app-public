import { Component, Input } from '@angular/core';
import { IEncounter } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IEncounter';
import { PeriodPipe } from '@pipes/period/period.pipe';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExpandableDirective } from '@directives/expandable/expandable.directive';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-encounter-item',
  templateUrl: './encounter-item.component.html',
  standalone: true,
  imports: [
    IonicModule,
    ExpandableDirective,
    RouterLink,
    TitleCasePipe,
    DatePipe,
    PeriodPipe,
  ],
})
export class EncounterItemComponent {
  @Input({ required: true }) encounter!: IEncounter;
  @Input() lines: 'none' | 'inset' | 'full' = 'inset';
  @Input({ required: true }) link!: string[];
  @Input() detail: boolean = false;
}
