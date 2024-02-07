import { Directive, Injector } from '@angular/core';
import { Params } from '@angular/router';
import { BundleEntry } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/bundleEntry';
import { Resource } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/resource';
import { IBundle } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IBundle';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { FhirApiService } from '../../fhir-api/fhir-api.service';
import { convertResourcesToFhirBundle } from '../../utils/fhir/bundle-functions';
import { log } from '../../utils/rxjs-log';
import { StateService } from './state.service';

export interface ResourceState {
  entry?: BundleEntry[];
  nextPageParams: Params;
  searchParams: Params;
  searchInput: string;
  scrollTop: number;
  settings: {
    resourceType?: string;
    params?: Params;
  };
}
export const initialResourceState: ResourceState = {
  entry: undefined,
  nextPageParams: {},
  searchParams: {},
  searchInput: '',
  scrollTop: 0,
  settings: {
    resourceType: '',
    params: {
      _sort: 'name',
      _count: 20,
    },
  },
};

@Directive()
// FIXME: Write interfaces for state subclass contracts with parent
export abstract class ResourceStateService<
  ChildState extends ResourceState,
> extends StateService<ChildState> {
  public readonly resourceType$ = this.select(
    (state) => state.settings.resourceType,
  );

  protected fhirApi: FhirApiService;

  constructor(
    private initialExtendedState: ChildState, // Do not remove!
    protected injector: Injector,
  ) {
    super(initialExtendedState);
    this.fhirApi = injector.get(FhirApiService);
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

  // - Create
  public postResources<Input = Resource[]>(
    resource: Input,
    converter?: (i: Input) => IBundle,
  ): Observable<boolean> {
    this.loading();
    const fhirBundle: IBundle = converter
      ? converter(resource)
      : convertResourcesToFhirBundle(resource as Resource | Resource[]);
    return this.fhirApi.postFhirBundle(fhirBundle).pipe(
      concatMap(() => this.getList()),
      catchError((e) => {
        if (!environment.production) {
          console.log(e.error.issue);
        }
        this.loading(false);
        return of(false);
      }),
    );
  }

  // - Read
  public getList(): Observable<boolean> {
    const resourceType = this.state.settings.resourceType;
    if (!resourceType) {
      console.warn('Resource type not set');
      return of(false);
    }
    const params = {
      ...this.state.settings?.params,
      ...this.state.searchParams,
    };
    this.loading();
    return this.fhirApi
      .getResourceBundle({
        resourceType,
        params,
      })
      .pipe(
        log('getEntryList', this.constructor.name),
        tap((bundle) => {
          this.setState({
            entry: bundle?.entry,
            nextPageParams: this.nextPageParams(bundle),
          } as ChildState),
            this.loading(false);
        }),
        map(() => true),
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
    if (Object.keys(this.state.nextPageParams).length === 0) {
      return of(false);
    }

    this.loading();

    return this.fhirApi
      .getResourceBundle({
        resourceType: this.state.settings.resourceType,
        params: this.state.nextPageParams,
      })
      .pipe(
        log('getMore', this.constructor.name),
        tap((bundle) => {
          this.setState({
            entry: [...(this.state.entry || []), ...(bundle.entry || [])],
            nextPageParams: this.nextPageParams(bundle),
          } as ChildState),
            this.loading(false);
        }),
        map(() => true),
        catchError((e) => {
          if (!environment.production) {
            console.log(e.error.issue);
          }
          this.loading(false);
          return of(false);
        }),
      );
  }

  public search(searchInput: string): Observable<boolean> {
    const searchParams = {
      ...this.state.searchParams,
      ...this.searchStringToParams(searchInput),
    };
    this.setState({
      searchInput,
      searchParams,
    } as ChildState);
    return this.getList();
  }

  // - Update

  // - Delete
  public deleteResource(id: string): Observable<boolean> {
    return this.fhirApi
      .deleteFhirResource(this.state.settings.resourceType, id)
      .pipe(concatMap((success) => (success ? of(true) : of(false))));
  }

  // Private methods
  private nextPageParams(bundle: IBundle): Params {
    if (!bundle) {
      return {};
    }
    const { link = undefined } = bundle;

    if (!link) {
      return {};
    }
    const linkNext = link.find((l) => l.relation === 'next');

    if (!linkNext || !linkNext.url) {
      return {};
    }

    const nextPageParamsString = new URL(linkNext.url).search;

    if (nextPageParamsString === '') {
      return {};
    }
    const paramsObject: Params = {};

    new URLSearchParams(nextPageParamsString).forEach((value, key) => {
      if (!paramsObject[key]) {
        paramsObject[key] = [];
      }
      paramsObject[key].push(value);
    });

    return Object.keys(paramsObject).length > 0 ? paramsObject : {};
  }

  private searchStringToParams(input: string = ''): Params {
    const output: Params = { name: [] };

    input
      .split(' ')
      .filter((searchString) => searchString.length > 0) // remove empty array items
      .forEach((searchString) => output['name'].push(searchString)); // append each remaining array item to params

    return output;
  }
}
