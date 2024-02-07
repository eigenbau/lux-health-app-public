/*
Notes:
This directive is used to remove a component's host element.
It thereby can maintain the correct element tree structure for nested Ionic components.
This helps to maintain the intended Ionic styling and functions.
Integrate it as hostDirective in any component that should have its host container removed.
*/

import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
  standalone: true,
})
export class RemoveHostDirective implements OnInit {
  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private domController: DomController,
  ) {}

  ngOnInit() {
    this.domController.write(() => {
      const nativeElement: HTMLElement = this.el.nativeElement;

      if (!nativeElement.parentElement)
        throw new Error(
          'RemoveHostDirective: Host element has no parent element.',
        );
      const parentElement: HTMLElement = nativeElement.parentElement;

      // move all children out of the element
      let currentChild = nativeElement.firstChild;
      while (currentChild) {
        const nextSibling = currentChild.nextSibling;
        this.renderer.insertBefore(parentElement, currentChild, nativeElement);
        currentChild = nextSibling;
      }

      // remove the empty element(the host)
      this.renderer.removeChild(parentElement, nativeElement);
    });
  }
}
