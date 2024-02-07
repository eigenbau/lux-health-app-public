import { Pipe, PipeTransform } from '@angular/core';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { buildObservationBundle } from '@core/utils/fhir/observation-functions';
import { arrayHasValue } from '@core/utils/object-functions';
import { ObservationBundle } from '@models/observation.model';

@Pipe({
  name: 'observationByCode',
  standalone: true,
})
export class ObservationByCodePipe implements PipeTransform {
  transform(
    observations: IObservation[] | undefined | null,
  ): ObservationBundle {
    if (!arrayHasValue(observations)) {
      throw new Error(
        'Observations in ObservationByCodePipe is undefined or null',
      );
    }
    const code = observations?.[0].code.coding?.[0].code;
    return buildObservationBundle(observations, code);
  }
}
