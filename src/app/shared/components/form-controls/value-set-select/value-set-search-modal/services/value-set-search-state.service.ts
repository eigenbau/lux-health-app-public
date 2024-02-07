import { Injectable, Injector } from '@angular/core';
import { User } from '@angular/fire/auth';
import {
  CollectionReference,
  DocumentReference,
  Firestore,
  collection,
  doc,
  docData,
  setDoc,
} from '@angular/fire/firestore';
import { ValueSetContains } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/valueSetContains';
import {
  Observable,
  catchError,
  combineLatest,
  firstValueFrom,
  map,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { USER_CUSTOM_VALUE_SETS } from '@core/config/firebase.constants';
import { NotificationsService } from '@core/notifications/notifications.service';
import {
  ValueSetState,
  initialValueSetState,
  ValueSetStateService,
} from '@core/state/abstract-services/value-set-state.service';
import {
  arrayHasValue,
  objectHasKeys,
  sortByString,
} from '@core/utils/object-functions';
import { log } from '@core/utils/rxjs-log';
import { UserCustomValueSets, ValueSetConfig } from '@models/value-set.model';

const initialValueSetSearchState = (
  config: ValueSetConfig = {},
): ValueSetState => {
  const {
    valueSet = undefined,
    valueSetCustomName = '',
    params: paramsObj = undefined,
    ecl = undefined,
  } = config;
  return {
    ...initialValueSetState,
    settings: {
      valueSet,
      valueSetCustomName,
      ecl,
      params: {
        ...initialValueSetState.settings.params,
        ...paramsObj,
      },
    },
  };
};

@Injectable({
  providedIn: 'root',
})
export class ValueSetSearchStateService extends ValueSetStateService<ValueSetState> {
  public readonly codeList$ = this.select((state) => state.contains);
  public readonly valueSetCustomName$ = this.select(
    (state) => state.settings.valueSetCustomName,
  );
  public readonly customCodeList$ = this.select((state) =>
    sortByString(state.containsCustom, ['display']),
  );

  private readonly userId$: Observable<User['uid']>;

  constructor(
    private firestore: Firestore,
    private auth: AuthService,
    private notifications: NotificationsService,
    protected override injector: Injector,
  ) {
    super(initialValueSetSearchState(), injector);
    this.userId$ = this.auth.user$.pipe(map((u) => u?.uid ?? ''));

    this.observeUserCustomValueSet(this.userId$)
      .pipe(
        tap((containsCustom) => {
          this.setState({ containsCustom });
        }),
      )
      .subscribe();
  }

  // API calls

  // - Read
  public override initList(config: ValueSetConfig): Observable<boolean> {
    if (!config) {
      return of(false);
    }
    this.setState({
      ...initialValueSetSearchState(config),
    });
    return of(true);
  }

  public async addCustomValue(
    valueSetContains: ValueSetContains,
  ): Promise<void> {
    if (
      this.valueSetHasValueAt(this.state.containsCustom, valueSetContains) > -1
    ) {
      this.notifications.showError('Code is already listed in favourites');

      return;
    }
    const containsCustom = [
      ...(this.state.containsCustom || []),
      valueSetContains,
    ];
    this.setState({ containsCustom });
    await this.persistCustomValueSetToFirestore();
    this.notifications.showSuccess('Code added to favoutites');
  }

  public async removeCustomValue(
    valueSetContains: ValueSetContains,
  ): Promise<void> {
    if (
      this.valueSetHasValueAt(this.state.containsCustom, valueSetContains) < 0
    ) {
      return;
    }
    const containsCustom = this.state.containsCustom.filter(
      (entry) => entry.code !== valueSetContains.code,
    );
    this.setState({ containsCustom });
    await this.persistCustomValueSetToFirestore();
  }

  // Private
  private async persistCustomValueSetToFirestore(): Promise<void> {
    const userId = await firstValueFrom(
      this.auth.user$.pipe(map((u) => u?.uid ?? '')),
    );
    const containsCustom = this.state.containsCustom;
    const valueSetCustomName = this.state.settings.valueSetCustomName;
    if (!valueSetCustomName) {
      return;
    }
    return setDoc(
      this.getDocRef(userId),
      { [valueSetCustomName]: containsCustom },
      { merge: true },
    );
  }

  private observeUserCustomValueSet(
    userId$: Observable<User['uid']>,
  ): Observable<ValueSetContains[]> {
    return combineLatest([
      userId$,
      this.select((state) => state.settings.valueSetCustomName || ''),
    ]).pipe(
      switchMap(([userId, valueSetCustomName]) =>
        this.observeCustomValueSetFromFirestore(userId, valueSetCustomName),
      ),
    );
  }

  private observeCustomValueSetFromFirestore(
    userId: string,
    valueSetCustomName: string,
  ): Observable<ValueSetContains[]> {
    return docData(this.getDocRef(userId)).pipe(
      takeUntil(this.destroy$),
      log('getStateFromFirestore', this.constructor.name),
      map((userCustomValueSets) =>
        objectHasKeys<UserCustomValueSets>(userCustomValueSets, [
          valueSetCustomName,
        ])
          ? userCustomValueSets[valueSetCustomName]
          : [],
      ),
      catchError((e) => of([])),
    );
  }

  private getDocRef(userId: string): DocumentReference<UserCustomValueSets> {
    const colRef = collection(
      this.firestore,
      USER_CUSTOM_VALUE_SETS,
    ) as CollectionReference<UserCustomValueSets>;
    return doc(colRef, userId);
  }

  private valueSetHasValueAt(
    vsArray: ValueSetContains[],
    vs: ValueSetContains,
  ): number {
    return vsArray.findIndex((vsArrayEntry) => vsArrayEntry.code === vs.code);
  }
}
