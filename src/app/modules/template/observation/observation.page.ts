import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { CodeableConcept } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/codeableConcept';
import { map, Observable } from 'rxjs';
import { FhirApiValueSetService } from '@core/fhir-api/fhir-api-value-set.service';
import { NotificationsService } from '@core/notifications/notifications.service';
import { TemplateObservationStateService } from '@core/state/template-observation-state.service';
import { sortByString } from '@core/utils/object-functions';
import { AbstractTemplateListDirective } from 'src/app/shared/directives/pages/template-list/abstract-template-list.directive';
import { ObservationFilterPipe } from '@pipes/observation-filter/observation-filter.pipe';
import { AsyncPipe } from '@angular/common';
import { ObservationListComponent } from '@components/observation-list/observation-list.component';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { HorizontalScrollSelectComponent } from '@components/horizontal-scroll-select/horizontal-scroll-select.component';
import { NavComponent } from '../components/nav/nav.component';
import { RemoveHostDirective } from '@directives/remove-host/remove-host.directive';
import { TemplateObservationInputDirective } from '@directives/modal-handlers/template-observation-input/template-observation-input.directive';
import { StandardHeaderDirective } from '@directives/standard-header/standard-header.directive';
import { IonicModule } from '@ionic/angular';
import { ObservationTemplate } from '@models/observation.model';

@Component({
  selector: 'app-observation',
  templateUrl: './observation.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    StandardHeaderDirective,
    TemplateObservationInputDirective,
    RemoveHostDirective,
    NavComponent,
    HorizontalScrollSelectComponent,
    ScrollToTopComponent,
    ObservationListComponent,
    AsyncPipe,
    ObservationFilterPipe,
  ],
})
export class ObservationPage extends AbstractTemplateListDirective<TemplateObservationStateService> {
  public list$: Observable<ObservationTemplate[]>;

  public observationCategory$: Observable<CodeableConcept[]>;

  constructor(
    private templateObservationState: TemplateObservationStateService,
    private valueSet: FhirApiValueSetService,
    private notifications: NotificationsService,
    protected override injector: Injector,
  ) {
    super(templateObservationState, injector);

    this.list$ = this.templateObservationState.list$;

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

  public async onDeleteObservationTemplate(id: string): Promise<void> {
    const deleteItem = await this.notifications.presentAlertDelete();
    if (deleteItem) {
      this.templateObservationState.deleteTemplate(id).subscribe();
    }
  }
}
