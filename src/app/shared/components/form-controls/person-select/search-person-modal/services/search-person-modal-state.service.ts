import { Injectable, Injector } from '@angular/core';
import { DirectoryPersonStateService } from '@core/state/abstract-services/directory-person-state.service';

@Injectable()
export class SearchPersonModalStateService extends DirectoryPersonStateService {
  constructor(protected override injector: Injector) {
    super(injector);
  }
}
