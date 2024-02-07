import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  CheckboxCustomEvent,
  ModalController,
  IonicModule,
} from '@ionic/angular';
import { CodeableConcept } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/codeableConcept';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { map, Observable, Subject } from 'rxjs';
import { FhirApiValueSetService } from '@core/fhir-api/fhir-api-value-set.service';
import { NotificationsService } from '@core/notifications/notifications.service';
import { codeableConceptsMatch } from '@core/utils/fhir/codeable-concept-functions';
import { sortByString } from '@core/utils/object-functions';
import { ObservationTemplate } from '@models/observation.model';
import { TemplateSelectionStateService } from './services/template-selection-state.service';
import { ObservationFilterPipe } from '@pipes/observation-filter/observation-filter.pipe';
import { AsyncPipe } from '@angular/common';
import { ObservationListComponent } from '@components/observation-list/observation-list.component';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { HorizontalScrollSelectComponent } from '@components/horizontal-scroll-select/horizontal-scroll-select.component';
import { TemplateBundle } from '@models/template.model';

@Component({
  selector: 'app-template-selection-modal',
  templateUrl: './template-selection-modal.page.html',
  providers: [TemplateSelectionStateService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    HorizontalScrollSelectComponent,
    ScrollToTopComponent,
    ObservationListComponent,
    AsyncPipe,
    ObservationFilterPipe,
  ],
})
export class TemplateSelectionModalPage {
  // UI output streams
  public templateBundle$: Observable<TemplateBundle>;
  public observationList$: Observable<ObservationTemplate[]>;

  public observationCategory$: Observable<CodeableConcept[]>;

  private readonly destroy$ = new Subject<null>();

  constructor(
    private notifications: NotificationsService,
    private modalController: ModalController,
    private templateSelectionState: TemplateSelectionStateService,
    private valueSet: FhirApiValueSetService,
  ) {
    this.templateBundle$ = this.templateSelectionState.templateBundle$;
    this.observationList$ = this.templateSelectionState.observationList$;

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

  // Public methods
  public onSubmit(): void {
    this.modalController.dismiss({
      templateBundle: this.templateSelectionState.templateBundle,
    });
  }

  public submitEnabled(): boolean {
    return true;
  }

  public closeModal(): void {
    this.notifications.presentAlertCancelAndCloseModal();
  }

  public onSelect(template: ObservationTemplate, event: Event): void {
    const checked = (event as CheckboxCustomEvent).detail.checked;
    this.templateSelectionState.setTemplateBundleObservation(template, checked);
  }

  public onResetSelection(category: 'observations'): void {
    this.templateSelectionState.setTemplateBundleToEmpty(category);
  }

  // FIXME: check for FirestoreId instead to avoid ambiguous results
  public observationIsSelected(
    observation: Partial<IObservation>,
  ): Observable<boolean> {
    return this.templateBundle$.pipe(
      map((templateBundle) => {
        if (templateBundle.observations?.length === 0) {
          return false;
        }
        return (
          templateBundle.observations.findIndex((entry) =>
            codeableConceptsMatch(entry.code, observation.code),
          ) > -1
        );
      }),
    );
  }
}
