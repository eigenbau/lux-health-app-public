import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IValueSet } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IValueSet';
import { Observable, of } from 'rxjs';
import { CustomParamEncoder } from './custom-param-encoder.service';
import { shareReplay } from 'rxjs/operators';
import {
  SNOMED_ECL_URL,
  TERMINOLOGY_API_URL,
  VALUE_SET_DEFAULT_PARAMS,
} from '../config/fhir.constants';
import { ValueSetConfig } from '@models/value-set.model';

const apiUrl = TERMINOLOGY_API_URL;

@Injectable({
  providedIn: 'root',
})
export class FhirApiValueSetService {
  constructor(private http: HttpClient) {}

  getValueSetLocally(valueSet: string = ''): Observable<IValueSet> {
    if (valueSet === '') {
      throw new Error('ValueSet is required.');
    }
    return this.http
      .get<IValueSet>(`assets/fhir/value-sets/${valueSet}.vs.fhir.json`)
      .pipe(shareReplay(1));
  }

  getValueSet(config: ValueSetConfig): Observable<IValueSet> {
    const { valueSet = '', params: paramsObj = {}, ecl = '' } = config;

    if (!valueSet && !paramsObj && !ecl) {
      throw new Error('Config is required.');
    }
    const paramsEclUrl = ecl ? { url: `${SNOMED_ECL_URL}${ecl}` } : null;

    // if ECL is given, ignore valueSet and retrieve implicit valueSet from ECL search instead
    const url =
      valueSet && !ecl ? `${apiUrl}${valueSet}/$expand` : `${apiUrl}$expand`;

    const params = new HttpParams({
      encoder: new CustomParamEncoder(),
      fromObject: {
        ...VALUE_SET_DEFAULT_PARAMS,
        ...paramsObj,
        ...paramsEclUrl,
      },
    });
    return this.http.get<IValueSet>(url, { params }).pipe(shareReplay(1));
  }
}
