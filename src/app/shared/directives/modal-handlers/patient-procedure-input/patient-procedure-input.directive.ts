import { Directive, HostListener, Input, Optional } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import { IResource } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IResource';
import { IProcedure } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IModel';
import { formatISO } from 'date-fns';
import { PatientProcedureStateService } from '@core/state/patient-procedure-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { PatientProcedureInputModalPage } from './patient-procedure-input-modal/patient-procedure-input-modal.page';

// This interface allows for the default value to hold string values instead of Date for start/end
interface ProcedureDefault extends IResource {
  performedPeriod: {
    start: string;
    end: string;
  };
  subject: Reference;
  encounter?: Reference;
}
@Directive({
  selector: '[appPatientProcedureInput]',
  standalone: true,
})
export class PatientProcedureInputDirective {
  @Input('appPatientProcedureInput') procedure: IProcedure | undefined;
  @Input() encounterId: string | undefined;
  @Input() dateTime: string | Date | undefined;
  @Input() duration: number | undefined;

  public now = formatISO(new Date());
  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(
    private modalController: ModalController,
    private patientProcedureState: PatientProcedureStateService,
    private patientState: PatientStateService,
    @Optional() private routerOutlet?: IonRouterOutlet,
  ) {}

  private get procedureDefault(): ProcedureDefault {
    const encounter = this.encounterId
      ? { reference: `Encounter/${this.encounterId}` }
      : undefined;

    return {
      resourceType: 'Procedure',
      performedPeriod: {
        start: this.now,
        end: this.now,
      },
      subject: {
        reference: `Patient/${this.patientState.patientId}`,
      },
      encounter,
    };
  }
  @HostListener('click') onClick() {
    this.openModal();
  }

  private async openModal(): Promise<void> {
    if (this.modalOpen) {
      return;
    }
    this.modalOpen = true;

    const procedure = this.procedure ? this.procedure : this.procedureDefault;
    const duration = this.duration;
    const dateTime = this.dateTime;

    const modal = await this.modalController.create({
      component: PatientProcedureInputModalPage,
      presentingElement:
        this.routerOutlet == null
          ? await this.modalController.getTop()
          : this.routerOutlet.nativeEl,
      componentProps: {
        procedure,
        duration,
        dateTime,
      },
    });

    modal.onDidDismiss().then((response) => {
      this.modalOpen = false;
      if (response?.data?.bundle) {
        // post bundle
        this.patientProcedureState
          .postResources(response?.data?.bundle)
          .subscribe();
      }
    });

    return await modal.present();
  }
}
