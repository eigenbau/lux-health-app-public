import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  UntypedFormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import { ICondition } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICondition';
import { IEncounter } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IEncounter';
import { IGoal } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IGoal';
import { format } from 'date-fns';
import {
  filter,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { FormHelperService } from '@core/forms/form-helper.service';
import { PatientConditionStateService } from '@core/state/patient-condition-state.service';
import { PatientEncounterStateService } from '@core/state/patient-encounter-state.service';
import { PatientGoalStateService } from '@core/state/patient-goal-state.service';
import { getReferencedResource } from '@core/utils/fhir/resource-functions';
import { arrayHasValue } from '@core/utils/object-functions';
import { RemoveHostDirective } from 'src/app/shared/directives/remove-host/remove-host.directive';
import { IonicModule } from '@ionic/angular';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

type ResourceType = 'Goal' | 'Condition' | 'Encounter';
@Component({
  selector: 'app-reference-select',
  templateUrl: './reference-select.component.html',
  hostDirectives: [RemoveHostDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    AsyncPipe,
  ],
})
export class ReferenceSelectComponent implements OnInit, OnDestroy {
  @Input({ required: true }) resourceType!: ResourceType;
  @Input({ required: true }) referenceFormControl!: UntypedFormControl;
  @Input() label: string = '';
  @Input() ariaLabel: string = '';
  @Input() labelPlacement:
    | 'end'
    | 'fixed'
    | 'floating'
    | 'stacked'
    | 'start'
    | '' = '';
  @Input() justify: 'end' | 'space-between' | 'start' | '' = '';
  @Input() ionSlot: 'start' | 'end' | 'label' | '' = '';
  @Input() ionSelectClass: string = '';
  @Input() placeholder: string = '';
  @Input() multiple = false;

  @Output() resourcesSelected = new EventEmitter<
    (IGoal | ICondition | IEncounter)[]
  >();

  destroy$ = new Subject<null>();

  public selectOptions$: Observable<Reference[]> | undefined;

  constructor(
    private goalState: PatientGoalStateService,
    private conditionState: PatientConditionStateService,
    private encounterState: PatientEncounterStateService,
    public fh: FormHelperService,
  ) {}

  ngOnInit(): void {
    this.selectOptions$ = this.initSelectOptions();
    this.referenceFormControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        startWith(this.referenceFormControl.value),
        map<Reference | Reference[], Reference['reference'][]>((ref) =>
          Array.isArray(ref) ? ref.map((r) => r.reference) : [ref?.reference],
        ),
        switchMap((references) => this.getSelectedResources(references)),
        tap((resources) => this.resourcesSelected.emit(resources)),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  private initSelectOptions(): Observable<Reference[]> | undefined {
    return this.resourceType === 'Goal'
      ? this.goalState.goalList$.pipe(
          map((goals) => this.referencesFromGoals(goals)),
        )
      : this.resourceType === 'Condition'
        ? this.conditionState.conditionList$.pipe(
            map((conditions) => this.referencesFromConditions(conditions)),
          )
        : this.resourceType === 'Encounter'
          ? this.encounterState.encounterList$.pipe(
              map((encounters) => this.referencesFromEncounters(encounters)),
            )
          : undefined;
  }

  private referencesFromGoals(goals: IGoal[]): Reference[] {
    if (!arrayHasValue(goals)) {
      return [];
    }
    return goals.map((goal) => ({
      reference: `Goal/${goal.id}`,
      display:
        goal.target && goal.target.length > 0 && goal.target[0].detailString
          ? `${goal.description.coding?.[0].display} - ${goal.target[0].detailString}`
          : goal.description.coding?.[0].display,
    }));
  }

  private referencesFromConditions(conditions: ICondition[]): Reference[] {
    if (!arrayHasValue(conditions)) {
      return [];
    }
    return conditions.map((condition) => ({
      reference: `Condition/${condition.id}`,
      display: condition.code?.coding?.[0].display,
    }));
  }

  private referencesFromEncounters(encounters: IEncounter[]): Reference[] {
    if (!arrayHasValue(encounters)) {
      return [];
    }
    return encounters.map((encounter) => ({
      reference: `Encounter/${encounter.id}`,
      display: `${format(
        new Date(encounter?.period?.start ?? ''),
        'd MMM y',
      )} • ${encounter?.class?.display}`,
    }));
  }

  private getSelectedResources(
    references: Reference['reference'][],
  ): Observable<(IGoal | ICondition | IEncounter)[]> {
    const resourceList$: Observable<(IGoal | ICondition | IEncounter)[]> =
      this.resourceType === 'Goal'
        ? this.goalState.goalList$
        : this.resourceType === 'Condition'
          ? this.conditionState.conditionList$
          : this.resourceType === 'Encounter'
            ? this.encounterState.encounterList$
            : of([]);

    return resourceList$.pipe(
      map((resources) =>
        references.map((ref) =>
          ref ? getReferencedResource(ref, resources) : undefined,
        ),
      ),
      filter((r): r is (IGoal | ICondition | IEncounter)[] => !!r),
    );
  }
}
