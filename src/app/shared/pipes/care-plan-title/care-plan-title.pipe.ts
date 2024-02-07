import { Pipe, PipeTransform } from '@angular/core';
import { ICarePlan } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICarePlan';
import { arrayHasValue } from '@core/utils/object-functions';

@Pipe({
  name: 'carePlanTitle',
  standalone: true,
})
export class CarePlanTitlePipe implements PipeTransform {
  transform(carePlan: ICarePlan | undefined | null): string {
    if (!carePlan || !carePlan.activity || carePlan.activity.length === 0) {
      return '';
    }
    const titleArray: string[] = carePlan.activity.map((activity) => {
      const coding = activity?.detail?.code?.coding;
      if (!arrayHasValue(coding)) {
        return '';
      }
      return coding?.[0].display && coding[0].display ? coding[0].display : '';
    });

    return titleArray.filter(Boolean).join(' • ');
  }
}
