import { Injectable, Injector } from '@angular/core';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { Observable, combineLatest, map, tap } from 'rxjs';
import { ChartTemplate } from '@models/template-chart.model';
import { CHART_TEMPLATE_PATH } from '../config/firebase.constants';
import {
  initialTemplateState,
  TemplateState,
  TemplateStateService,
} from './abstract-services/template-state.service';
import { TemplateObservationStateService } from './template-observation-state.service';

interface TemplateChartState extends TemplateState<ChartTemplate> {
  chartId: string;
}
const initialState: TemplateChartState = {
  ...initialTemplateState,
  chartId: '',
  list: [],
  settings: {
    documentPath: CHART_TEMPLATE_PATH,
  },
};
@Injectable({
  providedIn: 'root',
})
export class TemplateChartStateService extends TemplateStateService<
  TemplateChartState,
  ChartTemplate
> {
  public readonly list$: Observable<ChartTemplate[]>;
  public readonly chartTemplate$: Observable<ChartTemplate | undefined>;
  public readonly chartTemplateObservations$: Observable<IObservation[]>;

  constructor(
    protected override injector: Injector,
    private templateObservationState: TemplateObservationStateService,
  ) {
    super(initialState, injector);

    this.list$ = this.select((state) => state.list);
    this.chartTemplate$ = this.select(
      (state) =>
        state.list.find(
          ({ firestoreId }) => firestoreId === this.state.chartId,
        ) || undefined,
    );
    this.chartTemplateObservations$ = combineLatest([
      this.templateObservationState.list$,
      this.chartTemplate$,
    ]).pipe(
      map(([observationList, chartTemplate]) => ({
        filteredObservationList: observationList.filter(({ firestoreId }) =>
          chartTemplate?.observations
            ? chartTemplate.observations
                .map((entry) => entry.firestoreId)
                .indexOf(firestoreId) > -1
            : [],
        ),
        chartTemplate,
      })),
      tap(({ filteredObservationList, chartTemplate }) => {
        if (
          !(filteredObservationList instanceof Array) ||
          !(chartTemplate?.observations instanceof Array)
        ) {
          return;
        }
        if (
          filteredObservationList.length === chartTemplate.observations.length
        ) {
          return;
        }
        const observation = chartTemplate.observations.filter(
          ({ firestoreId }) =>
            filteredObservationList
              .map((entry) => entry.firestoreId)
              .indexOf(firestoreId) > -1,
        );
        // console.warn(
        //   'I could not find all observations for the chart. I removed the missing observations from the ChartTemplate.'
        // );
        this.setTemplate({
          ...chartTemplate,
          observations: observation,
        }).subscribe();
      }),
      map(
        ({ filteredObservationList }) =>
          filteredObservationList as IObservation[],
      ),
    );
  }

  // Public methods
  public setChartId(chartId: string): void {
    this.setState({ chartId });
  }
}
