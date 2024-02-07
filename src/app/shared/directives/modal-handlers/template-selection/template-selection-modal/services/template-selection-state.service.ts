import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StateService } from '@core/state/abstract-services/state.service';
import { TemplateObservationStateService } from '@core/state/template-observation-state.service';
import { codeableConceptsMatch } from '@core/utils/fhir/codeable-concept-functions';
import { ObservationTemplate } from '@models/observation.model';
import { TemplateBundle } from '@models/template.model';

interface State {
  templateBundle: TemplateBundle;
}

const initialState: State = {
  templateBundle: {
    observations: [],
  },
};
@Injectable({
  providedIn: 'root',
})
export class TemplateSelectionStateService extends StateService<State> {
  public readonly observationList$: Observable<ObservationTemplate[]>;
  public readonly templateBundle$: Observable<TemplateBundle>;

  constructor(
    private templateObservationState: TemplateObservationStateService,
  ) {
    super(initialState);

    this.observationList$ = this.templateObservationState.list$;
    this.templateBundle$ = this.select((state) => state.templateBundle);
  }

  public get templateBundle(): State['templateBundle'] {
    return this.state.templateBundle;
  }

  // FIXME: use FirestoreId as unique identifier instead to remove ambiguity
  public setTemplateBundleObservation(
    observationTemplate: ObservationTemplate,
    checked: boolean,
  ): void {
    const bundle = [...this.state.templateBundle.observations];

    const index = bundle.findIndex((entry) =>
      codeableConceptsMatch(entry.code, observationTemplate.code),
    );

    if (index < 0 && checked) {
      bundle.push(observationTemplate);
    }
    if (index >= 0 && !checked) {
      bundle.splice(index, 1);
    }

    this.setState({
      templateBundle: { ...this.state.templateBundle, observations: bundle },
    });
  }

  public setTemplateBundleToEmpty(category: 'observations'): void {
    const bundle: ObservationTemplate[] = [];
    this.setState({
      templateBundle: { ...this.state.templateBundle, [category]: bundle },
    });
  }
}
