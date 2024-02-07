import { Injectable } from '@angular/core';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { firstValueFrom, takeUntil, tap } from 'rxjs';
import { PersonList } from '@models/person-list.model';
import { StateService } from './abstract-services/state.service';
import { PersonStateService } from './person-state.service';
import { IBundle } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IBundle';
import { FhirApiService } from '@core/fhir-api/fhir-api.service';
import { removeUndefined } from '@core/utils/rxjs-functions';

// IMPORTANT: Do not use this state in patient-id.page as it would likely cause problems with circular dependencies
interface State {
  patientId: string;
  patient: IPatient | undefined;
  supporters: PersonList;
}

const initialState: State = {
  patientId: '',
  patient: undefined,
  supporters: [],
};
@Injectable({
  providedIn: 'root',
})
export class PatientStateService extends StateService<State> {
  public readonly patientId$ = this.select((state) => state.patientId);
  public readonly patient$ = removeUndefined(
    this.select((state) => state.patient),
  );

  constructor(
    private personState: PersonStateService,
    private fhirApi: FhirApiService,
  ) {
    super(initialState);

    this.personState.patient$
      .pipe(
        takeUntil(this.destroy$),
        tap((patient) => this.setState({ patientId: patient?.id, patient })),
      )
      .subscribe();

    this.personState.supporters$
      .pipe(
        takeUntil(this.destroy$),
        tap((supporters) => this.setState({ supporters })),
      )
      .subscribe();
  }

  public get patientId(): string {
    return this.state.patientId;
  }

  public async getPatientEverything(revinclude: string[]): Promise<IBundle> {
    const bundle = await firstValueFrom(
      this.fhirApi.getResourceBundle({
        resourceType: 'Patient',
        params: {
          _id: this.state.patientId,
          _revinclude: revinclude,
        },
      }),
    );
    return bundle;
  }
}

// FIXME: plan state dependencies and view dependencies to states
