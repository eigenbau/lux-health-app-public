import { Component } from '@angular/core';
import { ModalController, NavController, IonicModule } from '@ionic/angular';
import { Observable, map } from 'rxjs';
import { PatientConditionStateService } from '@core/state/patient-condition-state.service';
import { PersonStateService } from '@core/state/person-state.service';
import {
  buildKeyContactLink,
  telecomIcon,
  buildTelecomLink,
  formatAddress,
  buildAddressMapLink,
  addressIcon,
} from '@core/utils/fhir/address-and-contact-functions';
import { GenderIconPipe } from '@pipes/gender-icon/gender-icon.pipe';
import { AgePipe } from '@pipes/age/age.pipe';
import { NamePipe } from '@pipes/name/name.pipe';
import { ExpandableDirective } from '../../../expandable/expandable.directive';
import { AvatarComponent } from '@components/avatar/avatar.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { PersonBundle } from '@models/person-bundle.model';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';

@Component({
  selector: 'app-person-details-modal',
  templateUrl: './person-details-modal.page.html',
  styleUrls: ['./person-details-modal.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    AvatarComponent,
    ExpandableDirective,
    AsyncPipe,
    NamePipe,
    AgePipe,
    GenderIconPipe,
  ],
})
export class PersonDetailsModalPage {
  personBundle$: Observable<PersonBundle | undefined>;
  patientConditions$: Observable<string>;

  public buildKeyContactLink = buildKeyContactLink;
  public telecomIcon = telecomIcon;
  public buildTelecomLink = buildTelecomLink;
  public formatAddress = formatAddress;
  public buildAddressMapLink = buildAddressMapLink;
  public addressIcon = addressIcon;

  constructor(
    private personState: PersonStateService,
    private conditionState: PatientConditionStateService,
    private modalController: ModalController,
    private navController: NavController,
  ) {
    this.personBundle$ = this.personState.personBundle$;
    this.patientConditions$ = this.conditionState.conditionList$.pipe(
      map(
        (conditionList) =>
          conditionList?.map((cl) => cl.code?.coding?.[0]?.display).join(' • '),
      ),
    );
  }

  public async onGoToPersonDetails(personId: IPerson['id']): Promise<void> {
    await this.modalController.dismiss();

    this.navController.navigateBack(['/', 'app', 'main', 'person', personId]);
  }
  public async onGoToChart(
    personId: IPerson['id'],
    patientId: IPatient['id'],
  ): Promise<void> {
    await this.modalController.dismiss();

    this.navController.navigateBack([
      '/',
      'app',
      'main',
      'person',
      personId,
      'patient',
      patientId,
    ]);
  }
}
