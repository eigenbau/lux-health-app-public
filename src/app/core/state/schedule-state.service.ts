import { Injectable, Injector } from '@angular/core';
import { convertEncounterBundle } from '../utils/fhir/bundle-functions';
import {
  initialResourceState,
  ResourceState,
  ResourceStateService,
} from './abstract-services/resource-state.service';
import { PubSubService } from '@core/firebase/pub-sub.service';
import { switchMap, takeUntil } from 'rxjs';

const initialScheduleState: ResourceState = {
  ...initialResourceState,
  settings: {
    resourceType: 'Encounter',
    params: {
      _count: 20,
      _sort: '-date',
      _include: ['Encounter:subject'],
    },
  },
};
@Injectable({
  providedIn: 'root',
})
export class ScheduleStateService extends ResourceStateService<ResourceState> {
  public readonly scheduleList$ = this.select((state) =>
    state.entry ? convertEncounterBundle(state.entry) : [],
  );
  constructor(
    protected override injector: Injector,
    private pubSub: PubSubService,
  ) {
    super(initialScheduleState, injector);

    this.pubSub
      .observeFhirUpdates({
        resourceType: 'Encounter',
      })
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.getList()),
      )
      .subscribe();
  }
}
