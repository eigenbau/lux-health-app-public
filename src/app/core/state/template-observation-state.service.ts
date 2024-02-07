import { Injectable, Injector } from '@angular/core';
import { ObservationTemplate } from '@models/observation.model';
import { OBSERVATION_TEMPLATE_PATH } from '../config/firebase.constants';
import {
  initialTemplateState,
  TemplateState,
  TemplateStateService,
} from './abstract-services/template-state.service';

type ObservationTemplateState = TemplateState<ObservationTemplate>;
const initialState: ObservationTemplateState = {
  ...initialTemplateState,
  list: [],
  settings: {
    documentPath: OBSERVATION_TEMPLATE_PATH,
  },
};

@Injectable({
  providedIn: 'root',
})
export class TemplateObservationStateService extends TemplateStateService<
  ObservationTemplateState,
  ObservationTemplate
> {
  public readonly list$ = this.select((state) => state.list);

  constructor(protected override injector: Injector) {
    super(initialState, injector);
  }

  public get list(): ObservationTemplate[] {
    return this.state.list;
  }
}
