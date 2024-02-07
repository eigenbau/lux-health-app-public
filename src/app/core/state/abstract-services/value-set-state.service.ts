import { Injector } from '@angular/core';
import { Params } from '@angular/router';
import { ValueSetContains } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/valueSetContains';
import { IValueSet } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IValueSet';
import { Observable, of } from 'rxjs';
import { catchError, mapTo, tap } from 'rxjs/operators';
import { ValueSetConfig } from '@models/value-set.model';
import { environment } from 'src/environments/environment';
import { VALUE_SET_DEFAULT_PARAMS } from '../../config/fhir.constants';
import { FhirApiValueSetService } from '../../fhir-api/fhir-api-value-set.service';
import { log } from '../../utils/rxjs-log';
import { StateService } from './state.service';

export interface ValueSetState {
  contains: ValueSetContains[];
  containsCustom: ValueSetContains[];
  total: number;
  nextPageParams: Params;
  searchParams: Params;
  searchInput: string;
  scrollTop: number;
  settings: ValueSetConfig;
}
export const initialValueSetState: ValueSetState = {
  contains: [],
  containsCustom: [],
  total: 0,
  nextPageParams: {},
  searchParams: {},
  searchInput: '',
  scrollTop: 0,
  settings: {
    valueSetCustomName: '',
    valueSet: undefined,
    ecl: undefined,
    params: VALUE_SET_DEFAULT_PARAMS,
  },
};

export abstract class ValueSetStateService<
  ChildState extends ValueSetState,
> extends StateService<ChildState> {
  protected fhirApiValueSet: FhirApiValueSetService;

  constructor(
    private initialExtendedState: ChildState,
    protected injector: Injector,
  ) {
    super(initialExtendedState);
    this.fhirApiValueSet = injector.get(FhirApiValueSetService);
  }

  // Search input
  public get searchInput() {
    return this.state.searchInput;
  }

  // Scroll position
  public get scrollTop() {
    return this.state.scrollTop;
  }

  public set scrollTop(scrollTop: number) {
    this.setState({ scrollTop } as ChildState);
  }

  // Init state
  public initList(args?: any): Observable<boolean> {
    // Use this in router guard to conditionally initialize the state

    // check if all required data from parent states is available, e.g. resourceId

    // check if these have changed, if so then trigger state update and getList()

    // if state.entry !== null return of(true), as no reload is required

    // return false to invoke canActivate fail
    return of(false);
  }

  // API calls

  // - Read
  public getList(): Observable<boolean> {
    this.loading();
    const settings: ValueSetConfig = {
      valueSet: this.state.settings.valueSet,
      ecl: this.state.settings.ecl,
      params: {
        ...this.state.settings.params,
        ...this.state.searchParams,
      },
    };

    return this.fhirApiValueSet.getValueSet(settings).pipe(
      log('getCodes', this.constructor.name),
      tap((vs) => {
        this.setState({
          contains: vs?.expansion?.contains,
          total: vs?.expansion?.total,
          nextPageParams: this.nextPageParams(vs),
        } as ChildState),
          this.loading(false);
      }),
      mapTo(true),
      catchError((e) => {
        if (!environment.production) {
          console.log(e);
        }
        this.loading(false);
        return of(false);
      }),
    );
  }

  public getMore(): Observable<boolean> {
    if (this.state.nextPageParams === null) {
      return of(false);
    }
    this.loading();

    const settings: ValueSetConfig = {
      valueSet: this.state.settings.valueSet,
      ecl: this.state.settings.ecl,
      params: this.state.nextPageParams,
    };

    return this.fhirApiValueSet.getValueSet(settings).pipe(
      log('getMore', this.constructor.name),
      tap((vs) => {
        this.setState({
          contains: [
            ...this.state.contains,
            ...(vs?.expansion?.contains || []),
          ],
          total: vs?.expansion?.total,
          nextPageParams: this.nextPageParams(vs),
        } as ChildState),
          this.loading(false);
      }),
      mapTo(true),
      catchError((e) => {
        if (!environment.production) {
          console.log(e);
        }
        this.loading(false);
        return of(false);
      }),
    );
  }
  public search(searchInput: string): Observable<boolean> {
    if (searchInput === '') {
      this.setState({
        ...this.initialExtendedState,
        containsCustom: this.state.containsCustom,
        settings: this.state.settings,
      });
      return of(true);
    }

    const searchParams = this.searchStringToParams(searchInput);
    this.setState({
      searchInput,
      searchParams,
    } as ChildState);
    return this.getList();
  }
  // Private methods
  private nextPageParams(valueSet: IValueSet): Params {
    if (valueSet === null) {
      return {};
    }
    const total = valueSet.expansion?.total || 0;
    const currentOffset = this.state.nextPageParams['offset']
      ? this.state.nextPageParams['offset']
      : 0;
    const settingsParams = this.state.settings.params;
    const searchParams = this.state.searchParams;
    const offset = currentOffset + this.state?.settings?.params?.['count'];

    if (offset >= total) {
      return {};
    }

    return { ...settingsParams, ...searchParams, offset };
  }

  private searchStringToParams(input: string = ''): Params {
    const output = { filter: input };

    return output;
  }
}
