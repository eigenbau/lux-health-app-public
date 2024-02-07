import {
  Directive,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';
import { TemplateState } from '@core/state/abstract-services/template-state.service';

interface TemplateStateService<T> {
  loading$: Observable<boolean>;
  scrollTop: number;
}

@Directive()
export abstract class AbstractTemplateListDirective<
    ChildStateService extends TemplateStateService<State>,
    State extends TemplateState = TemplateState,
  >
  implements OnInit, OnDestroy
{
  @ViewChild(IonContent) content: IonContent | undefined;

  // UI output streams
  public loading$: Observable<boolean>;

  protected readonly destroy$ = new Subject<null>();

  private initTemplateCalled = false;

  constructor(
    private state: ChildStateService,
    protected injector: Injector,
  ) {
    this.loading$ = this.state.loading$;
  }

  ngOnInit(): void {
    this.initTemplate();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  ionViewWillEnter(): void {
    if (this.content) this.content.scrollToPoint(0, this.state.scrollTop);
  }

  ionViewWillLeave(): void {
    if (this.content)
      this.content
        .getScrollElement()
        .then((el) => (this.state.scrollTop = el.scrollTop));
  }

  protected initTemplate(): void {
    if (this.initTemplateCalled) {
      return;
    }
    this.initTemplateCalled = true;
  }
}
