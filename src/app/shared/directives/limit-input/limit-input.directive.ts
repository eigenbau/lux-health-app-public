import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { IonInput } from '@ionic/angular';

interface DirectiveParams {
  type?: 'tel' | 'email' | 'letters' | 'numeric' | 'alphanumeric' | 'other';
  max?: number;
}
@Directive({
  selector: '[appLimitInput]',
  standalone: true,
})
export class LimitInputDirective implements OnInit {
  @Input('appLimitInput') params: DirectiveParams = {};

  type = 'other';
  max = 30;

  constructor(
    public el: ElementRef,
    public renderer: Renderer2,
  ) {}

  @HostListener('ionInput', ['$event.target.value']) onInput(
    event: string,
  ): void {
    this.format(event);
  }

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    if (event.clipboardData)
      this.format(event.clipboardData.getData('text/plain'));
  }

  @HostListener('ionBlur', ['$event.target.value']) onBlur(
    event: string,
  ): void {
    this.removeTrailingSpace(event);
  }

  ngOnInit(): void {
    if (this.el.nativeElement.localName !== 'ion-input') {
      console.error(
        'LimitInputDirective can only be applied to ion-input element. It is currently bound to: ' +
          this.el.nativeElement.localName,
      );
    }
    this.format(this.el.nativeElement.value); // format any initial values
  }

  format(val: string): void {
    if (!val) {
      return;
    }
    const { max = this.max } = this.params;
    const returnValue = this.selectFormatType(val);
    const removedSpaces = returnValue.replace(/^\s|\s(?!\S|$)/g, '');
    const limitedLength = removedSpaces.substring(0, max);
    this.renderer.setProperty(this.el.nativeElement, 'value', limitedLength);
  }

  selectFormatType(val: string): string {
    const { type = this.type } = this.params;

    if (type === 'email') {
      return this.formatEmail(val);
    }
    if (type === 'tel') {
      return this.formatPhoneNumberUS(val);
    }
    if (type === 'letters') {
      return this.formatLetters(val);
    }
    if (type === 'numeric') {
      return this.formatNumeric(val);
    }
    if (type === 'alphanumeric') {
      return this.formatAlphanumeric(val);
    }
    return val;
  }

  removeTrailingSpace(val: string): void {
    if (!val) {
      return;
    }
    const removedSpaces = val.replace(/\s$/g, '');
    this.renderer.setProperty(this.el.nativeElement, 'value', removedSpaces);
  }

  formatPhoneNumberUS(val: string): string {
    const num = val.replace(/\D/g, '');

    if (num.length === 0) {
      return '';
    }

    const numberWithoutCountryCode =
      num.substring(0, 1) === '1'
        ? num.substring(1).substring(0, 10)
        : num.substring(0, 10);

    const countryCode = '+1';
    const areaCode =
      numberWithoutCountryCode.length > 0
        ? ` (${numberWithoutCountryCode.substring(0, 3)}`
        : '';
    const phoneNumberPartOne =
      numberWithoutCountryCode.length > 3
        ? `) ${numberWithoutCountryCode.substring(3, 6)}`
        : '';
    const phoneNumberPartTwo =
      numberWithoutCountryCode.length > 6
        ? `-${numberWithoutCountryCode.substring(6)}`
        : '';

    return countryCode + areaCode + phoneNumberPartOne + phoneNumberPartTwo;
  }

  formatEmail(val: string): string {
    return val.toLowerCase();
  }

  formatLetters(val: string): string {
    // const reg = new RegExp(/[\W\d]/g);
    const reg = new RegExp(/([^a-zA-Z'-]+)/g);
    const str = val.replace(reg, '');
    return str;
  }

  formatNumeric(val: string): string {
    const reg = new RegExp(/\D/g);
    const str = val.replace(reg, '');
    return str;
  }

  formatAlphanumeric(val: string): string {
    const reg = new RegExp(/[^a-zA-Z'-\d ]+/g);
    const str = val.replace(reg, '');
    return str;
  }
}
