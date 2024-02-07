// Source: https://coryrylan.com/blog/managing-external-links-safely-in-angular

import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  PLATFORM_ID,
} from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[href]',
  standalone: true,
})
export class ExternalLinkDirective implements OnChanges {
  @HostBinding('attr.rel') relAttr: string | undefined = undefined;
  @HostBinding('attr.target') targetAttr: string | undefined = undefined;
  @Input() href: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    private elementRef: ElementRef,
  ) {}
  ngOnChanges() {
    if (!this.href) {
      return;
    }
    this.elementRef.nativeElement.href = this.href;

    if (this.isLinkExternal()) {
      this.relAttr = 'noopener';
      this.targetAttr = '_blank';
    } else {
      this.relAttr = '';
      this.targetAttr = '';
    }
  }

  private isLinkExternal() {
    return (
      isPlatformBrowser(this.platformId) &&
      !this.elementRef.nativeElement.href.includes(location.hostname)
    );
  }
}
