import { Pipe, PipeTransform } from '@angular/core';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { filterObservations } from '@core/utils/fhir/observation-functions';
import {
  ObservationFilter,
  ObservationTemplate,
} from '@models/observation.model';

@Pipe({
  name: 'observationFilter',
  pure: false,
  standalone: true,
})
export class ObservationFilterPipe implements PipeTransform {
  transform(
    observations: IObservation[] | ObservationTemplate[] | undefined | null,
    filter: ObservationFilter,
  ): IObservation[] | ObservationTemplate[] {
    return observations ? filterObservations(observations, filter) : [];
  }
}
