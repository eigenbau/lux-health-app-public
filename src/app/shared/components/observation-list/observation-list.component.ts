import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Input,
  TemplateRef,
} from '@angular/core';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { buildCategories } from '@core/utils/fhir/observation-functions';
import {
  ObservationBundle,
  ObservationsByCategory,
  ObservationTemplate,
} from '@models/observation.model';
import { IonicModule } from '@ionic/angular';
import {
  NgIf,
  NgClass,
  NgTemplateOutlet,
  NgFor,
  TitleCasePipe,
} from '@angular/common';

export interface ViewContext {
  $implicit: IObservation;
  index: number;
}

@Component({
  selector: 'app-observation-list',
  templateUrl: './observation-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, IonicModule, NgClass, NgTemplateOutlet, NgFor, TitleCasePipe],
})
export class ObservationListComponent {
  @Input() listHeader = true;
  @Input() loading = false;
  @Input() hideNoObservationsFound = false;

  // hasFormControls is used to conditionally disable trackBy Fn,
  // as it causes changes in observations input not to be propagated to child FormControls
  @Input() hasFormControls = false;
  @Input() inset = false;
  @Input({ required: true }) set observations(observations: IObservation[]) {
    this.observationsByCategory = buildCategories(observations);
  }

  @ContentChild('templateHeader', { read: TemplateRef })
  templateHeader: TemplateRef<ViewContext> | undefined;
  @ContentChild('templateListItem', { read: TemplateRef })
  templateListItem: TemplateRef<ViewContext> | undefined;

  public observationsByCategory: ObservationsByCategory[] = [];

  constructor() {}
}
