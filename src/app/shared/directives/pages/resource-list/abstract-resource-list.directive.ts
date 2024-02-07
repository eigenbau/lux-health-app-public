import {
  AfterViewInit,
  Directive,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { IonContent, IonInfiniteScroll, IonRefresher } from '@ionic/angular';
import { Observable, Subject, of } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
  tap,
} from 'rxjs/operators';
import { ResourceState } from '@core/state/abstract-services/resource-state.service';

interface ResourceStateService<T> {
  state$: Observable<T>;
  loading$: Observable<boolean>;
  resourceType$?: Observable<string | undefined> | undefined;
  scrollTop: number;
  getMore(): Observable<boolean>;
  getList(): Observable<boolean>;
  search(searchInput: string): Observable<boolean>;
}

@Directive()
export abstract class AbstractResourceListDirective<
    ChildStateService extends ResourceStateService<State>,
    State extends ResourceState = ResourceState,
  >
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll | undefined;
  @ViewChild(IonRefresher) refresher: IonRefresher | undefined;
  @ViewChild(IonContent) content: IonContent | undefined;

  // UI input streams
  public searchInput = new UntypedFormControl();

  // UI output streams
  public state$: Observable<State>;
  public loading$: Observable<boolean>;

  public readonly resourceType$: Observable<string | undefined> | undefined;

  protected readonly destroy$ = new Subject<null>();

  private initTemplateCalled = false;

  constructor(
    private state: ChildStateService,
    protected injector: Injector,
  ) {
    this.state$ = this.state.state$;
    this.loading$ = this.state.loading$;

    this.resourceType$ = this.state.resourceType$;
  }

  ngOnInit(): void {
    this.initTemplate();
  }

  ngAfterViewInit(): void {
    if (this.infiniteScroll) {
      this.infiniteScroll.threshold = '100px';
      this.infiniteScroll.ionInfinite
        .pipe(
          takeUntil(this.destroy$),
          switchMap(() => this.loadMore()),
          tap((loadMore) => {
            if (!loadMore && this.infiniteScroll) {
              this.infiniteScroll.complete();
            }
          }),
        )
        .subscribe();
    }
    if (this.refresher) {
      this.refresher.pullMin = 100;
      this.refresher.ionRefresh
        .pipe(
          takeUntil(this.destroy$),
          switchMap(() => this.refresh()),
        )
        .subscribe();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  ionViewWillEnter(): void {
    this.content?.scrollToPoint(0, this.state.scrollTop);
  }

  ionViewWillLeave(): void {
    if (this.content) {
      this.content
        .getScrollElement()
        .then((el) => (this.state.scrollTop = el.scrollTop));
    }
  }

  loadMore(): Observable<boolean> {
    return this.state.getMore();
  }

  refresh(): Observable<boolean> {
    return this.state.getList();
  }

  protected initTemplate(): void {
    if (this.initTemplateCalled) {
      return;
    }
    this.initTemplateCalled = true;

    // Link state search method to searchInput
    this.searchInput.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => this.state.search(value)),
      )
      .subscribe();
    // Reset infiniteScroll and refresher when state loading completed
    this.state.loading$
      .pipe(
        takeUntil(this.destroy$),
        tap((l) => {
          if (!l && this.infiniteScroll) {
            this.infiniteScroll.complete();
          }
          if (!l && this.refresher) {
            this.refresher.complete();
          }
        }),
      )
      .subscribe();
    // Disable infiniteScroll when no further pages exist
    this.state$
      .pipe(
        takeUntil(this.destroy$),
        map((state) => state.nextPageParams),
        distinctUntilChanged(),
        tap((params) => {
          if (this.infiniteScroll) {
            this.infiniteScroll.disabled = !!(params === null);
          }
        }),
      )
      .subscribe();
  }
}
