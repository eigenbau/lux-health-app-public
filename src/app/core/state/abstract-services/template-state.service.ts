import { Directive, Injector } from '@angular/core';
import {
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
  doc,
  Firestore,
  setDoc,
} from '@angular/fire/firestore';
import { catchError, from, map, Observable, of, takeUntil, tap } from 'rxjs';
import { FirestoreDoc } from '@models/firestore-doc.model';
import { environment } from 'src/environments/environment';
import { log } from '../../utils/rxjs-log';
import { StateService } from './state.service';

export interface TemplateState<T = unknown> {
  list: T[];
  scrollTop: number;
  settings: {
    documentPath: string;
  };
}
export const initialTemplateState: TemplateState = {
  list: [],
  scrollTop: 0,
  settings: {
    documentPath: '',
  },
};

@Directive()
export abstract class TemplateStateService<
  ChildState extends TemplateState,
  TemplateType extends FirestoreDoc = FirestoreDoc,
> extends StateService<ChildState> {
  protected firestore: Firestore;

  constructor(
    private initialExtendedState: ChildState,
    protected injector: Injector,
  ) {
    super(initialExtendedState);
    this.firestore = injector.get(Firestore);

    this.observeList()
      .pipe(
        takeUntil(this.destroy$),
        tap((list) => this.setState({ list } as ChildState)),
      )
      .subscribe();
  }

  // Scroll position
  public get scrollTop() {
    return this.state.scrollTop;
  }

  public set scrollTop(scrollTop: number) {
    this.setState({ scrollTop } as ChildState);
  }

  // - Create / Update
  public setTemplate(template: TemplateType): Observable<boolean> {
    this.loading();
    const docRef =
      template.firestoreId !== ''
        ? doc(this.getColRef(), template.firestoreId)
        : doc(this.getColRef());
    const { firestoreId, ...templateWithoutId } = template;
    return from(setDoc(docRef, templateWithoutId)).pipe(
      map(() => true),
      tap(() => this.loading(false)),
      catchError((e) => {
        if (!environment.production) {
          console.log(e);
        }
        this.loading(false);
        return of(false);
      }),
    );
  }

  // - Delete
  public deleteTemplate(id: string): Observable<boolean> {
    this.loading();
    const docRef = doc(this.getColRef(), id);
    return from(deleteDoc(docRef)).pipe(
      log('deleteTemplate', this.constructor.name),
      map(() => true),
      tap(() => this.loading(false)),
      catchError((e) => {
        if (!environment.production) {
          console.log(e);
        }
        this.loading(false);
        return of(false);
      }),
    );
  }

  // - Read
  private observeList(): Observable<TemplateType[]> {
    this.loading();
    return collectionData(this.getColRef(), { idField: 'firestoreId' }).pipe(
      log('observeList', this.constructor.name),
      tap(() => this.loading(false)),
      catchError((e) => {
        if (!environment.production) {
          console.log(e);
        }
        this.loading(false);
        return of([]);
      }),
    );
  }

  private getColRef(): CollectionReference<TemplateType> {
    return collection(
      this.firestore,
      this.initialExtendedState.settings.documentPath,
    ) as CollectionReference<TemplateType>;
  }
}
