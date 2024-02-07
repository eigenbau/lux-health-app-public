import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  UntypedFormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  CheckboxCustomEvent,
  ModalController,
  IonicModule,
} from '@ionic/angular';
import { CodeableConcept } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/codeableConcept';
import {
  distinctUntilChanged,
  map,
  Observable,
  startWith,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { FhirApiValueSetService } from '@core/fhir-api/fhir-api-value-set.service';
import { NotificationsService } from '@core/notifications/notifications.service';
import { sortByString } from '@core/utils/object-functions';
import { ChartTemplate } from '@models/template-chart.model';
import { TemplateChartInputStateService } from './services/template-chart-input-state.service';
import { ObservationFilterPipe } from '@pipes/observation-filter/observation-filter.pipe';
import { AsyncPipe } from '@angular/common';
import { ObservationListComponent } from '@components/observation-list/observation-list.component';
import { HorizontalScrollSelectComponent } from '@components/horizontal-scroll-select/horizontal-scroll-select.component';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { ObservationTemplate } from '@models/observation.model';

@Component({
  selector: 'app-template-chart-input-modal',
  templateUrl: './template-chart-input-modal.page.html',
  providers: [TemplateChartInputStateService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    ScrollToTopComponent,
    HorizontalScrollSelectComponent,
    FormsModule,
    ReactiveFormsModule,
    ObservationListComponent,
    AsyncPipe,
    ObservationFilterPipe,
  ],
})
export class TemplateChartInputModalPage implements OnInit, OnDestroy {
  @Input() chartTemplate: ChartTemplate | undefined;

  // UI input streams
  public searchInputFormControl = new UntypedFormControl();
  public chartTemplateTitleFormControl = new UntypedFormControl('', {
    validators: Validators.required,
  });

  // UI output streams
  public chartTemplate$: Observable<ChartTemplate>;
  public observationList$: Observable<ObservationTemplate[]>;

  public observationCategory$: Observable<CodeableConcept[]>;

  private readonly destroy$ = new Subject<null>();

  constructor(
    private notifications: NotificationsService,
    private modalController: ModalController,
    private templateChartInputState: TemplateChartInputStateService,
    private valueSet: FhirApiValueSetService,
  ) {
    this.chartTemplate$ = this.templateChartInputState.chartTemplate$;
    this.observationList$ = this.templateChartInputState.observationList$;

    this.observationCategory$ = this.valueSet
      .getValueSetLocally('observation-category')
      .pipe(
        map((vs) => vs.expansion?.contains),
        map((valueSetContains) =>
          valueSetContains
            ? valueSetContains.map((code) => ({ coding: [code] }))
            : [],
        ),
        map((codeableConcept) =>
          sortByString(codeableConcept, ['coding', 0, 'display']),
        ),
      );
  }

  ngOnInit(): void {
    this.templateChartInputState.setChartTemplate(this.chartTemplate);
    this.chartTemplateTitleFormControl.setValue(
      this.templateChartInputState.chartTemplate.title,
    );

    this.chartTemplateTitleFormControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        startWith(this.chartTemplate?.title ? this.chartTemplate.title : ''),
        tap((value) => {
          this.templateChartInputState.setChartTemplateTitle(value);
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
  // Public methods
  public onSubmit(): void {
    this.modalController.dismiss({
      chartTemplate: this.templateChartInputState.chartTemplate,
    });
  }

  public closeModal(): void {
    this.notifications.presentAlertCancelAndCloseModal();
  }

  public onSelectObservation(id: string, event: Event): void {
    const checked = (event as CheckboxCustomEvent).detail.checked;
    this.templateChartInputState.setChartTemplateObservation(id, checked);
  }

  public onResetObservationSelection(): void {
    this.templateChartInputState.setChartTemplateObservationToEmpty();
  }

  public isSelectedObservation(firestoreId: string): Observable<boolean> {
    return this.chartTemplate$.pipe(
      map((chartTemplate) => {
        if (
          !chartTemplate.observations ||
          chartTemplate.observations.length === 0
        ) {
          return false;
        }
        return (
          chartTemplate.observations.findIndex(
            (entry) => entry.firestoreId === firestoreId,
          ) > -1
        );
      }),
    );
  }
}
