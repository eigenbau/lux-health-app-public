import {
  AfterViewInit,
  Directive,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { IonContent, IonRefresher } from '@ionic/angular';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil, switchMap, tap, concatMap } from 'rxjs/operators';
import { NotificationsService } from '@core/notifications/notifications.service';
import { ResourceState } from '@core/state/abstract-services/resource-state.service';
import { environment } from 'src/environments/environment';
import { RoutingService } from '@core/routing/routing.service';
import { ActivatedRoute } from '@angular/router';

interface ResourceStateService<T> {
  state$: Observable<T>;
  loading$: Observable<boolean>;
  getList(): Observable<boolean>;
  deleteResource(id: string, cascade?: boolean): Observable<boolean>;
}

@Directive()
export class AbstractResourcePageDirective<
    ChildStateService extends ResourceStateService<State>,
    State extends ResourceState = ResourceState,
  >
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(IonRefresher) refresher: IonRefresher | undefined;
  @ViewChild(IonContent, { read: ElementRef }) refresherElement:
    | ElementRef
    | undefined;
  @ViewChild(IonContent) content: IonContent | undefined;

  // UI output streams
  public state$: Observable<State>;
  public loading$: Observable<boolean>;

  protected notifications: NotificationsService;
  protected routing: RoutingService;
  protected route: ActivatedRoute;

  protected readonly destroy$ = new Subject<null>();

  private initTemplateCalled = false;

  constructor(
    private state: ChildStateService,
    protected injector: Injector,
  ) {
    this.state$ = this.state.state$;
    this.loading$ = this.state.loading$;
    this.notifications = injector.get(NotificationsService);
    this.routing = injector.get(RoutingService);
    this.route = injector.get(ActivatedRoute);
  }

  ngOnInit(): void {
    this.initTemplate();
  }

  ngAfterViewInit(): void {
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

  initRefresher(): void {
    if (!environment.production) {
      console.log('loaded');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  refresh(): Observable<boolean> {
    return this.state.getList();
  }

  public async deleteResource(id: string | undefined): Promise<void> {
    if (!id) {
      throw new Error(`No id supplied to 'deleteResource()'`);
    }
    const deleteItem = await this.notifications.presentAlertDelete();
    if (!deleteItem) {
      return;
    }
    // Delete Fhir resource
    this.deleteFhirResource(id).subscribe();
  }

  // Protected methods
  protected deleteFhirResource(id: string): Observable<boolean> {
    this.notifications.presentLoader();
    return this.state.deleteResource(id).pipe(
      concatMap((success) => {
        this.notifications.dismissLoader();
        if (success) {
          this.notifications.showSuccess('Resource deleted!');
          return of(true);
        }
        this.notifications.showError(
          `Sorry, I couldn't delete the resource.
          One or more resources are likely still linked to it.
          Delete these first and try again.`,
        );
        return of(false);
      }),
    );
  }

  protected initTemplate(): void {
    if (this.initTemplateCalled) {
      return;
    }
    this.initTemplateCalled = true;

    // Reset infiniteScroll and refresher when state loading completed
    this.loading$
      .pipe(
        takeUntil(this.destroy$),
        tap((l) => {
          if (!l && this.refresher) {
            this.refresher.complete();
          }
        }),
      )
      .subscribe();
  }
}
