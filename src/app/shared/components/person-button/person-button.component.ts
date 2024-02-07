import { Component } from '@angular/core';
import { PatientStateService } from '@core/state/patient-state.service';
import { PersonStateService } from '@core/state/person-state.service';
import { AgePipe } from '@pipes/age/age.pipe';
import { NamePipe } from '@pipes/name/name.pipe';
import { NgIf, AsyncPipe } from '@angular/common';
import { PersonDetailsDirective } from '@directives/modal-handlers/person-details/person-details.directive';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';

@Component({
  selector: 'app-person-button',
  templateUrl: './person-button.component.html',
  styles: [
    `
      ion-button {
        --height: var(--toolbar-button-height);
        --icon-size: var(--toolbar-button-icon-height);
        --padding-start: calc((var(--height) - var(--icon-size)) / 2);
        --padding-end: calc((var(--height) - var(--icon-size)) / 2);
        font-size: 14px;
      }
      ion-text {
        padding-inline-start: calc(
          (var(--height) / 2) - (calc((var(--height) - var(--icon-size)) / 2))
        );
        padding-inline-end: calc(var(--height) / 4);
      }
      ion-icon {
        font-size: var(--icon-size) !important;
        margin-inline-start: 0 !important;
      }
    `,
  ],
  standalone: true,
  imports: [
    IonicModule,
    PersonDetailsDirective,
    NgIf,
    AsyncPipe,
    NamePipe,
    AgePipe,
  ],
})
export class PersonButtonComponent {
  public person$: Observable<IPerson | undefined>;
  public patient$: Observable<IPatient>;

  constructor(
    private personState: PersonStateService,
    private patientState: PatientStateService,
  ) {
    this.person$ = this.personState.person$;
    this.patient$ = this.patientState.patient$;
  }
}
