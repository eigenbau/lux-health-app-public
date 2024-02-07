import { Injectable, Injector } from '@angular/core';
import { PersonResourceType } from '@models/person-resource-type.model';
import { DirectoryPersonStateService } from './abstract-services/directory-person-state.service';

@Injectable({
  providedIn: 'root',
})
export class DirectoryRelatedPersonStateService extends DirectoryPersonStateService {
  resourceType: PersonResourceType = 'RelatedPerson';

  constructor(protected override injector: Injector) {
    super(injector);
  }
}
