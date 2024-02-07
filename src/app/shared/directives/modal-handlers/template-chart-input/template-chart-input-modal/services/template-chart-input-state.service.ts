import { Injectable } from '@angular/core';
import { Observable, takeUntil, tap } from 'rxjs';
import { StateService } from '@core/state/abstract-services/state.service';
import { TemplateObservationStateService } from '@core/state/template-observation-state.service';
import { capitalize } from '@core/utils/string-functions';
import { ObservationTemplate } from '@models/observation.model';
import { ChartTemplate } from '@models/template-chart.model';

interface State {
  observationList: ObservationTemplate[];
  chartTemplate: ChartTemplate;
}

const initialState: State = {
  observationList: [],
  chartTemplate: {
    firestoreId: '',
    title: '',
    observations: [],
  },
};

@Injectable({
  providedIn: 'root',
})
export class TemplateChartInputStateService extends StateService<State> {
  public readonly chartTemplate$ = this.select((state) => state.chartTemplate);

  public readonly observationList$: Observable<ObservationTemplate[]> =
    this.select((state) => state.observationList);

  constructor(
    private templateObservationState: TemplateObservationStateService,
  ) {
    super(initialState);
    this.templateObservationState.list$
      .pipe(
        takeUntil(this.destroy$),
        tap((observationList) => this.setState({ observationList })),
      )
      .subscribe();
  }

  public get chartTemplate(): ChartTemplate {
    return { ...this.state.chartTemplate };
  }

  public setChartTemplate(
    chartTemplate: ChartTemplate = { ...initialState.chartTemplate },
  ): void {
    this.setState({ chartTemplate });
  }

  public setChartTemplateObservation(
    firestoreId: string,
    checked: boolean,
  ): void {
    const observations = Array.isArray(this.chartTemplate.observations)
      ? [...this.chartTemplate.observations]
      : [];
    const index = observations.findIndex(
      (entry) => entry.firestoreId === firestoreId,
    );
    if (index < 0 && checked) {
      observations.push({ firestoreId });
    }
    if (index >= 0 && !checked) {
      observations.splice(index, 1);
    }

    this.setState({
      chartTemplate: { ...this.state.chartTemplate, observations },
    });
  }

  public setChartTemplateObservationToEmpty(): void {
    const observations: ChartTemplate[] = [];
    this.setState({
      chartTemplate: { ...this.state.chartTemplate, observations },
    });
  }

  public setChartTemplateTitle(input: string): void {
    const title = capitalize(input.trim());
    this.setState({
      chartTemplate: { ...this.state.chartTemplate, title },
    });
  }
}
