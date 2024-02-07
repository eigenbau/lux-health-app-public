import { DOCUMENT, NgFor, NgIf, AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  NonNullableFormBuilder,
} from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { BehaviorSubject, startWith, Subject, takeUntil, tap } from 'rxjs';
import { FormHelperService } from '@core/forms/form-helper.service';
import { UiSettingsStateService } from '@core/state/ui-settings-state.service';
import { updateObjectValue } from '@core/utils/object-functions';
import { UiSettingsState } from '@models/ui-settings.model';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';
import { FormGroupFor } from '@models/form.model';

type UIPartial = Omit<UiSettingsState, 'deviceOrientation' | 'onlineStatus'>;
type Form = FormGroupFor<UIPartial>;

@Component({
  selector: 'app-theme-modal',
  templateUrl: './theme-modal.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    NgIf,
    AsyncPipe,
    FormControlPipe,
  ],
})
export class ThemeModalPage implements OnDestroy {
  public form: FormGroup<Form>;

  public readonly darkModeActive$: BehaviorSubject<boolean>;
  protected readonly destroy$ = new Subject<null>();

  constructor(
    public modalController: ModalController,
    public fh: FormHelperService,
    private fb: NonNullableFormBuilder,
    private uiSettingsState: UiSettingsStateService,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.form = this.fb.group<Form>({
      appUsesOsDarkMode: this.fb.control(false),
      appDarkMode: this.fb.control(false),
      colors: this.fb.group({
        secondaryHueOffset: this.fb.control(0),
        light: this.fb.group({
          primary: this.fb.group({
            hue: this.fb.control(0),
            saturation: this.fb.control(0),
            luminance: this.fb.control(0),
          }),
        }),
        dark: this.fb.group({
          primary: this.fb.group({
            hue: this.fb.control(0),
            saturation: this.fb.control(0),
            luminance: this.fb.control(0),
          }),
        }),
      }),
    });

    this.darkModeActive$ = this.uiSettingsState.darkModeActive$;

    this.uiSettingsState.state$
      .pipe(
        takeUntil(this.destroy$),
        tap((state) => this.form.patchValue(state, { emitEvent: false })),
      )
      .subscribe();

    this.form
      .get('appUsesOsDarkMode')
      ?.valueChanges.pipe(
        takeUntil(this.destroy$),
        startWith(this.form.get('appUsesOsDarkMode')?.value || false),
        tap((flag) => {
          const appDarkMode = this.form.get('appDarkMode');
          if (flag && appDarkMode) {
            appDarkMode.disable();
          }
          if (!flag && appDarkMode) {
            appDarkMode.enable();
          }
          this.uiSettingsState.setAppUsesOsDarkMode(!!flag);
        }),
      )
      .subscribe();

    this.form
      .get('appDarkMode')
      ?.valueChanges.pipe(
        startWith(this.form.get('appDarkMode')?.value),
        takeUntil(this.destroy$),
        tap((flag) => this.uiSettingsState.setAppDarkMode(!!flag)),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  public dismiss(): void {
    this.modalController.dismiss({
      dismissed: true,
    });
  }

  public async onSubmit(): Promise<void> {
    await this.uiSettingsState.persistUiSettingsToFirestore();
    this.dismiss();
  }

  public onColorChange(event: Event, statePath: string[]): void {
    const colorValue = +(event as CustomEvent).detail.value;
    const formState: Omit<
      UiSettingsState,
      'deviceOrientation' | 'onlineStatus'
    > = { ...this.form.getRawValue() };
    const formStateWithUpdatedColor = updateObjectValue(
      formState,
      colorValue,
      statePath,
    );
    this.uiSettingsState.setColors(formStateWithUpdatedColor.colors);
  }
}
