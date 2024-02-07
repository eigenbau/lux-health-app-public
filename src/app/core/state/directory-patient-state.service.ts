import { Injectable, Injector } from '@angular/core';
import { Params } from '@angular/router';
import { formatISO, subMonths } from 'date-fns';
import { Observable, of } from 'rxjs';
import { PatientDirectoryFilters } from '@models/directory.model';
import { PersonResourceType } from '@models/person-resource-type.model';
import { DirectoryPersonStateService } from './abstract-services/directory-person-state.service';

@Injectable({
  providedIn: 'root',
})
export class DirectoryPatientStateService extends DirectoryPersonStateService {
  resourceType: PersonResourceType = 'Patient';

  public override readonly filtersActive$: Observable<PatientDirectoryFilters> =
    this.select((state) => ({
      onlyRecent:
        !!state.searchParams && !!state.searchParams[this.searchParamsKey],
    }));

  private searchParamsKey = '_has:Encounter:patient:date';
  // using FHIR API 'gt' (greater than) to filter: https://www.hl7.org/fhir/search.html#prefix
  private greaterThanOneMonthAgo =
    'gt' +
    formatISO(subMonths(new Date(), 1), {
      representation: 'date',
    });

  constructor(protected override injector: Injector) {
    super(injector);
  }

  public override toggleRecentOnly(): Observable<boolean> {
    const searchParams: Params = {
      ...this.state.searchParams,
      [this.searchParamsKey]: this.greaterThanOneMonthAgo,
    };

    if (
      this.state.searchParams &&
      this.state.searchParams[this.searchParamsKey]
    ) {
      delete searchParams[this.searchParamsKey];
    }

    this.setState({
      searchParams,
    });
    return this.getList();
  }
}
