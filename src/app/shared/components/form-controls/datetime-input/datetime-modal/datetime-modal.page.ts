import { Component, Input } from '@angular/core';
import {
  UntypedFormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';

export type Presentation =
  | 'date'
  | 'date-time'
  | 'month'
  | 'month-year'
  | 'time'
  | 'time-date'
  | 'year';

@Component({
  selector: 'app-datetime-modal',
  templateUrl: './datetime-modal.page.html',
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule],
})
export class DatetimeModalPage {
  @Input({ required: true }) datetimeFormControl!: UntypedFormControl;
  @Input() presentation: Presentation = 'date-time';
  @Input() size: 'cover' | 'fixed' = 'fixed';
  @Input() firstDayOfWeek = 1;
  @Input() min: string = '';
  @Input() max: string = '';
  @Input() minuteValues: number[] | number | string | undefined = undefined;

  constructor() {}
}
