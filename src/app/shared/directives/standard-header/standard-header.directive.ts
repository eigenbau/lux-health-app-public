import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { DomController, IonContent } from '@ionic/angular';
import { distinctUntilChanged, map, Subject, takeUntil, tap } from 'rxjs';

@Directive({
  selector: '[appStandardHeader]',
  standalone: true,
})
export class StandardHeaderDirective implements OnInit {
  @Input('appStandardHeader') scrollElement: IonContent | undefined;

  private destroy$ = new Subject<null>();
  private rangeMin = 10;
  private rangeMax = 60;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private domController: DomController,
  ) {}

  ngOnInit(): void {
    if (this.el.nativeElement.localName !== 'ion-header') {
      console.error(
        'StandardHeaderDirective can only be applied to ion-header element. It is currently bound to: ' +
          this.el.nativeElement.localName,
      );
    }

    this.domController.write(() => {
      this.renderer.addClass(this.el.nativeElement, 'header-collapse-main');
      this.renderer.setProperty(this.el.nativeElement, 'translucent', true);
      this.renderer.setStyle(this.el.nativeElement, '--opacity-scale', 0, 1);
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
            this.domController.write(() => {
              this.renderer.setStyle(
                this.el.nativeElement,
                '--opacity-scale',
                fraction,
                1,
              );
            });
          }),
        )
        .subscribe();
    }
  }

  private convertToFraction(pos: number): number {
    return pos < this.rangeMin
      ? 0
      : pos < this.rangeMax
        ? (pos - this.rangeMin) / this.rangeMax
        : 1;
  }
}
