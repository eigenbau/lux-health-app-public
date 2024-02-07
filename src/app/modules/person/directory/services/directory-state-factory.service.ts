import { ActivatedRoute } from '@angular/router';
import { DirectoryPatientStateService } from '@core/state/directory-patient-state.service';
import { DirectoryPractitionerStateService } from '@core/state/directory-practitioner-state.service';
import { DirectoryRelatedPersonStateService } from '@core/state/directory-related-person-state.service';
import { toPascalCase } from '@core/utils/string-functions';
import { PersonResourceType } from '@models/person-resource-type.model';

export const directoryStateFactoryService =
  () =>
  (
    route: ActivatedRoute,
    patientState: DirectoryPatientStateService,
    relatedPersonState: DirectoryRelatedPersonStateService,
    practitionerState: DirectoryPractitionerStateService,
  ):
    | DirectoryPatientStateService
    | DirectoryPractitionerStateService
    | DirectoryRelatedPersonStateService => {
    const resourceType = toPascalCase(
      route.snapshot.params['resourceType'],
    ) as PersonResourceType;

    switch (resourceType) {
      case 'Patient':
        return patientState;
      case 'RelatedPerson':
        return relatedPersonState;
      case 'Practitioner':
        return practitionerState;
      default:
        return patientState;
    }
  };
