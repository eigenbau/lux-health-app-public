import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { DomController, IonContent } from '@ionic/angular';
import { distinctUntilChanged, map, Subject, takeUntil, tap } from 'rxjs';

@Directive({
  selector: '[appShowOnScroll]',
  standalone: true,
})
export class ShowOnScrollDirective implements OnInit, OnDestroy {
  @Input('appShowOnScroll') scrollElement: IonContent | undefined;

  private destroy$ = new Subject<null>();
  private originalClientHeight = 100;
  private rangeMin = 75;
  private rangeMax = 100;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private domController: DomController,
  ) {}

  ngOnInit(): void {
    if (this.el.nativeElement.localName !== 'ion-toolbar') {
      console.error(
        'ShowOnScrollDirective can only be applied to ion-toolbar element. It is currently bound to: ' +
          this.el.nativeElement.localName,
      );
    }

    this.domController.write(() => {
      this.renderer.setStyle(this.el.nativeElement, 'padding-bottom', 0);
      this.renderer.setStyle(this.el.nativeElement, 'overflow', 'hidden');
      this.renderer.setStyle(this.el.nativeElement, 'position', 'absolute'); // required for smooth content scrolling
      this.renderer.setStyle(this.el.nativeElement, 'pointer-events', 'none'); // required for smooth content scrolling
      this.transformNativeElement(0);
    });

    if (this.scrollElement) {
      this.scrollElement.scrollEvents = true;
      this.scrollElement.ionScroll
        .pipe(
          takeUntil(this.destroy$),
          map((customEvent) =>
            this.convertToFraction(customEvent.detail.scrollTop),
          ),
          distinctUntilChanged(),
          tap((fraction) => {
            this.transformNativeElement(fraction);
          }),
        )
        .subscribe();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  private convertToFraction(pos: number): number {
    return pos < this.rangeMin
      ? 0
      : pos < this.rangeMax
        ? (pos - this.rangeMin) / this.rangeMax
        : 1;
  }

  private transformNativeElement(fraction: number): void {
    const height =
      this.originalClientHeight * fraction >= 1
        ? this.originalClientHeight * fraction
        : 1;

    this.domController.write(() => {
      this.renderer.setStyle(
        this.el.nativeElement,
        'max-height',
        `${height}px`,
      );
      Array.from(this.el.nativeElement.children).forEach((child) => {
        this.renderer.setStyle(child, 'opacity', fraction);
      });
    });
  }
}
