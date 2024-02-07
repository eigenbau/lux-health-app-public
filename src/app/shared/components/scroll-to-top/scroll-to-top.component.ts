import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { DomController, IonContent, IonicModule } from '@ionic/angular';
import { Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-scroll-to-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-chip color="primary">
      <ion-label>Scroll Up</ion-label>
      <ion-icon name="chevron-up-outline"></ion-icon>
    </ion-chip>
  `,
  styles: [
    `
      :host {
        position: absolute;
        left: 50%;
        bottom: -24px;
        transform: translate(-50%, -50%);
        margin: 0 auto;
        z-index: 1;
        opacity: 0;
        -webkit-transition:
          bottom 0.25s ease-out,
          opacity 0.25s ease-out;
        -moz-transition:
          bottom 0.25s ease-out,
          opacity 0.25s ease-out;
        -o-transition:
          bottom 0.25s ease-out,
          opacity 0.25s ease-out;
        transition:
          bottom 0.25s ease-out,
          opacity 0.25s ease-out;
      }
      :host.isActive {
        bottom: 8px;
        opacity: 1;
      }
      ion-chip {
        background: hsla(
          var(--color-primary-h),
          var(--color-primary-s),
          var(--color-primary-l),
          0.95
        );
        color: var(--ion-color-primary-contrast);
      }
    `,
  ],
  standalone: true,
  imports: [IonicModule],
})
export class ScrollToTopComponent implements OnInit, OnDestroy {
  @Input() scrollElement: IonContent | undefined;

  private showElement = false;
  private destroy$ = new Subject<null>();

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private domController: DomController,
  ) {}

  @HostListener('click') onClick() {
    if (this.scrollElement) {
      this.scrollElement.scrollToTop(500);
    }
  }

  ngOnInit() {
    if (this.scrollElement) {
      this.scrollElement.scrollEvents = true;
      this.scrollElement.ionScroll
        .pipe(
          takeUntil(this.destroy$),
          map((pos) =>
            pos.detail.deltaY < 0 && pos.detail.scrollTop > 50
              ? true
              : pos.detail.deltaY > 0 || pos.detail.scrollTop <= 50
                ? false
                : this.showElement,
          ),
          distinctUntilChanged(),
          tap((showElement) => {
            if (showElement) {
              this.domController.write(() => {
                this.renderer.addClass(this.el.nativeElement, 'isActive');
              });
            }
            if (!showElement) {
              this.domController.write(() => {
                this.renderer.removeClass(this.el.nativeElement, 'isActive');
              });
            }
          }),
        )
        .subscribe();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
