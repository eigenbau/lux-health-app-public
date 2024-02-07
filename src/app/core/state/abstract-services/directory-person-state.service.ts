import { Directive, Injector } from '@angular/core';
import { Observable, of, switchMap, takeUntil, tap } from 'rxjs';
import { PatientDirectoryFilters } from '@models/directory.model';
import { PersonBundle } from '@models/person-bundle.model';
import { PersonResourceType } from '@models/person-resource-type.model';
import {
  convertBundleEntryToPersonList,
  convertPersonBundleToFhirBundle,
} from '../../utils/fhir/bundle-functions';
import {
  initialResourceState,
  ResourceStateService,
  ResourceState,
} from './resource-state.service';
import { PubSubService } from '@core/firebase/pub-sub.service';

const initialDirectoryState: ResourceState = {
  ...initialResourceState,
  settings: {
    resourceType: '',
    params: {
      _sort: 'name',
      _count: 20,
      _revinclude: ['Person:link'],
    },
  },
};

@Directive()
export abstract class DirectoryPersonStateService extends ResourceStateService<ResourceState> {
  public readonly personList$ = this.select((state) =>
    convertBundleEntryToPersonList(state.entry),
  );

  // Filter flag
  public readonly filtersActive$!: Observable<PatientDirectoryFilters>; // FIXME: May need to review if 'Non-null Assertion Operator' is suitable here

  protected pubSub: PubSubService;

  constructor(protected override injector: Injector) {
    super(initialDirectoryState, injector);
    this.pubSub = injector.get(PubSubService);

    // Subscribe to FHIR updates manually,
    // as the subscription in the abstract ResourceStateService
    // does not execute for DirectoryPersonState
    this.pubSub
      .observeFhirUpdates({ resourceType: 'Person' })
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.getList()),
      )
      .subscribe();
  }

  // API calls

  // - Create
  public createPerson(personBundle: PersonBundle): Observable<boolean> {
    const converter = convertPersonBundleToFhirBundle;
    return this.postResources<PersonBundle>(personBundle, converter);
  }

  // - Read
  public override initList(
    resourceType: PersonResourceType,
  ): Observable<boolean> {
    if (this.state.entry || !resourceType) {
      return of(false);
    }
    this.setState({
      settings: {
        ...this.state.settings,
        resourceType,
      },
    });

    return this.getList();
  }

  // Filter function used in DirectoryPatientState
  // It is defined here to make it callable from the DirectoryState in the DirectoryPage
  // The actual method logic is located in the DirectoryPatientState service
  public toggleRecentOnly(): Observable<boolean> {
    return of(false);
  }
}
