// State management based on:
// - https://dev.to/angular/simple-yet-powerful-state-management-in-angular-with-rxjs-4f8g
// - https://www.maestralsolutions.com/angular-application-state-management-you-do-not-need-external-data-stores/
// - https://stackblitz.com/edit/rxjs-angular-state-manager?file=src%2Fapp%2Fmodules%2Ftodo%2Fservices%2Ftodos-state.service.ts

import { Directive, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Directive()
export abstract class StateService<T> implements OnDestroy {
  public readonly state$: Observable<T>;
  public readonly loading$: Observable<boolean>;
  protected readonly destroy$ = new Subject<null>();

  private stateBehaviorSubject$: BehaviorSubject<T>;
  private loadingBehaviorSubject$: BehaviorSubject<boolean>;

  constructor(private initialState: T) {
    this.stateBehaviorSubject$ = new BehaviorSubject<T>(initialState);
    this.loadingBehaviorSubject$ = new BehaviorSubject<boolean>(false);

    this.state$ = this.select((state) => state);
    this.loading$ = this.loadingBehaviorSubject$
      .asObservable()
      .pipe(distinctUntilChanged());
  }

  protected get state(): T {
    return this.stateBehaviorSubject$.getValue();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
    this.stateBehaviorSubject$.complete();
    this.loadingBehaviorSubject$.complete();
  }

  protected select<K>(mapFn: (state: T) => K): Observable<K> {
    return this.stateBehaviorSubject$.asObservable().pipe(
      map((state: T) => mapFn(state)),
      distinctUntilChanged(),
    );
  }

  protected setState(newState: Partial<T>): void {
    this.stateBehaviorSubject$.next({
      ...this.state,
      ...newState,
    });
  }

  protected loading(status: boolean = true): void {
    if (this.loadingBehaviorSubject$.value !== status) {
      this.loadingBehaviorSubject$.next(status);
    }
  }
}
