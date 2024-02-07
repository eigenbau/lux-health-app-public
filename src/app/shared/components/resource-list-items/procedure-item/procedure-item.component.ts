import { Component, Input } from '@angular/core';
import { IProcedure } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IProcedure';
import { PeriodPipe } from '@pipes/period/period.pipe';
import { NgIf, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExpandableDirective } from '@directives/expandable/expandable.directive';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-procedure-item',
  templateUrl: './procedure-item.component.html',
  standalone: true,
  imports: [
    IonicModule,
    ExpandableDirective,
    RouterLink,
    NgIf,
    TitleCasePipe,
    PeriodPipe,
  ],
})
export class ProcedureItemComponent {
  @Input({ required: true }) procedure!: IProcedure;
  @Input() lines: 'none' | 'inset' | 'full' = 'inset';
  @Input({ required: true }) link!: string[];
  @Input() detail: boolean = false;
}
