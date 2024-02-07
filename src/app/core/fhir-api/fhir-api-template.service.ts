import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FhirApiTemplateService {
  constructor(private http: HttpClient) {}

  getTemplate(
    resourceType: string,
    template: string
  ): Observable<IObservation> {
    return this.http.get<IObservation>(
      `assets/fhir/templates/${resourceType}/${template}.template.fhir.json`
    );
  }
}
