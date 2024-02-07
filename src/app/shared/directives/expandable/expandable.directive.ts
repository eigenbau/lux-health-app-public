import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
  selector: '[appExpandable]',
  standalone: true,
})
export class ExpandableDirective implements OnInit {
  @Input('appExpandable') trigger: HTMLElement | undefined = undefined;

  private expanded = false;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private domController: DomController,
  ) {}
  @HostListener('click') onClick() {
    if (!this.trigger) {
      this.toggle();
    }
  }

  ngOnInit(): void {
    this.domController.write(() => {
      this.renderer.addClass(this.el.nativeElement, 'expandable');
    });
    if (this.trigger) {
      this.renderer.listen(this.trigger, 'click', () => this.toggle());
    }
    if (this.el.nativeElement.classList.contains('expanded')) {
      this.expanded = true;
    }
  }

  private toggle(): void {
    if (this.expanded) {
      this.domController.write(() => {
        this.renderer.removeClass(this.el.nativeElement, 'expanded');
      });
    }
    if (!this.expanded) {
      this.domController.write(() => {
        this.renderer.addClass(this.el.nativeElement, 'expanded');
      });
    }
    this.expanded = !this.expanded;
  }
}
