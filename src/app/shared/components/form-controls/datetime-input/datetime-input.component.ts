import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import {
  Observable,
  Subject,
  distinctUntilChanged,
  of,
  startWith,
  takeUntil,
  tap,
} from 'rxjs';
import {
  DatetimeModalPage,
  Presentation,
} from './datetime-modal/datetime-modal.page';
import { RemoveHostDirective } from 'src/app/shared/directives/remove-host/remove-host.directive';
import { AsyncPipe, DatePipe } from '@angular/common';
import { formatISO, parseISO } from 'date-fns';

@Component({
  selector: 'app-datetime-input',
  templateUrl: './datetime-input.component.html',
  hostDirectives: [RemoveHostDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonicModule, AsyncPipe, DatePipe],
})
export class DatetimeInputComponent implements OnInit, OnDestroy {
  @Input() displayFormat: string = '';
  @Input() presentation: Presentation = 'date'; // Controls the presentation
  @Input() representation: 'complete' | 'date' | 'time' | undefined; // Controls what is passed to the FormControl
  @Input() readonly = false;
  @Input({ required: true }) datetimeFormControl!: UntypedFormControl;
  @Input() min: string = '';
  @Input() max: string = '';
  @Input() minuteValues: number[] | number | string | undefined = undefined;
  @Input() label: string = '';
  @Input() ariaLabel = '';
  @Input() labelPlacement: 'end' | 'fixed' | 'floating' | 'stacked' | 'start' =
    'start';
  @Input() inputClass = 'space-between';
  destroy$ = new Subject<null>();

  public datetime$: Observable<string | number | Date> = of('');

  private modalOpen = false; // Prevents opening of multiple instances on fast clicks

  constructor(public modalController: ModalController) {}

  ngOnInit(): void {
    if (!this.representation) {
      this.representation =
        this.presentation === 'date'
          ? 'date'
          : this.presentation === 'time'
            ? 'time'
            : 'complete';
    }

    this.datetime$ = this.datetimeFormControl.valueChanges.pipe(
      startWith(this.datetimeFormControl.value),
      distinctUntilChanged(),
    );
    this.datetimeFormControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap((v) => {
          this.datetimeFormControl.setValue(
            formatISO(parseISO(v), { representation: this.representation }),
            {
              emitEvent: false,
            },
          );
        }),
      )
      .subscribe();
  }
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  public async openDatetime(): Promise<void> {
    if (this.modalOpen || this.readonly) {
      return;
    }
    this.modalOpen = true;
    const modal = await this.modalController.create({
      component: DatetimeModalPage,
      cssClass: this.presentation,
      componentProps: {
        datetimeFormControl: this.datetimeFormControl,
        presentation: this.presentation,
        size: 'cover',
        min: this.min,
        max: this.max,
        minuteValues: this.minuteValues,
      },
    });

    modal.onDidDismiss().then(() => {
      this.modalOpen = false;
    });

    return await modal.present();
  }
}
