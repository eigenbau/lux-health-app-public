import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import {
  collection,
  CollectionReference,
  Firestore,
  doc,
  setDoc,
  docData,
  DocumentReference,
} from '@angular/fire/firestore';
import { DomController, Platform } from '@ionic/angular';
import { KeyboardEventDetail } from '@ionic/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  firstValueFrom,
  from,
  fromEvent,
  fromEventPattern,
  map,
  merge,
  Observable,
  of,
  scan,
  share,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { UiSettingsState } from '@models/ui-settings.model';
import { LuxUser } from '@models/user.model';
import { log } from '../utils/rxjs-log';
import { StateService } from './abstract-services/state.service';
import { User } from '@angular/fire/auth';
import { AuthService } from '../auth/auth.service';

const initialState: UiSettingsState = {
  deviceOrientation: 'portrait',
  onlineStatus: true,
  appUsesOsDarkMode: true,
  appDarkMode: false,
  colors: {
    light: {
      primary: {
        hue: 320,
        saturation: 0,
        luminance: 50,
      },
    },
    dark: {
      primary: {
        hue: 320,
        saturation: 0,
        luminance: 50,
      },
    },
    secondaryHueOffset: 40,
  },
};

@Injectable({
  providedIn: 'root',
})
export class UiSettingsStateService extends StateService<UiSettingsState> {
  // State chunks
  public darkModeActive$ = new BehaviorSubject<boolean>(false);
  public onlineStatus$ = this.select((state) => state.onlineStatus);
  public deviceOrientation$ = this.select((state) => state.deviceOrientation);

  private matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
  private renderer: Renderer2;
  private darkThemeClass = 'dark';
  private statusBarClass = 'ios-status-bar-bg';
  private user$: Observable<User | null>;

  constructor(
    private platform: Platform,
    private firestore: Firestore,
    private redererFactory: RendererFactory2,
    private domController: DomController,
    private auth: AuthService,
    @Inject(DOCUMENT) private document: Document,
  ) {
    super(initialState);

    this.user$ = this.auth.user$;

    // FIXME: review if use of renderFactory alone is best practice
    // or if renderer calls should be encapsulated in domController.write()

    this.renderer = this.redererFactory.createRenderer(null, null);

    this.observeUserUiSettings()
      .pipe(
        takeUntil(this.destroy$),
        tap((uiSettings) => {
          this.setState({ ...uiSettings });
        }),
      )
      .subscribe();

    this.observeDeviceOrientation()
      .pipe(
        takeUntil(this.destroy$),
        tap((deviceOrientation) => this.setState({ deviceOrientation })),
      )
      .subscribe();

    this.observeOnlineStatus()
      .pipe(
        takeUntil(this.destroy$),
        tap((onlineStatus) => this.setState({ onlineStatus })),
      )
      .subscribe();

    this.observeDarkMode()
      .pipe(
        takeUntil(this.destroy$),
        tap((darkModeActive) => this.changeDarkModeCssClass(darkModeActive)),
        tap((darkModeActive) => this.darkModeActive$.next(darkModeActive)),
      )
      .subscribe();

    this.observeNumberOfOpenModals()
      .pipe(
        takeUntil(this.destroy$),
        tap((numberOfOpenModals) =>
          this.changeStatusBarCssClass(numberOfOpenModals),
        ),
      )
      .subscribe();

    // FIXME: Still struggling to find a good solution.
    // Currently the modal jumps up/down when the virtual keyboard is toggled.
    // Listening to visualViewport resize does not solve the problem.
    this.observeKeyboard().pipe(
      takeUntil(this.destroy$),
      tap((n) => this.setViewHeightCssProperty(n)),
      switchMap(() => this.observeScroll()),
      tap((n) => {
        if (n > 0) {
          console.log(
            'Safari keyboard scroll fix: Reseting window scroll position from',
            n,
          );
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto',
          });
          document.body.scrollTop = 0;
        }
      }),
    );
    //.subscribe();

    this.observeColor()
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.changeColorsInCss()),
      )
      .subscribe();
  }

  // Public
  public get colors(): UiSettingsState['colors'] {
    return this.state.colors;
  }

  public setAppUsesOsDarkMode(appUsesOsDarkMode: boolean): void {
    this.setState({ appUsesOsDarkMode });
  }

  public setAppDarkMode(appDarkMode: boolean): void {
    this.setState({ appDarkMode });
  }

  public setColors(colors: UiSettingsState['colors']): void {
    this.setState({ colors });
  }

  public getHSLColorWheel(): string[] {
    const color = this.darkModeActive$.value
      ? { ...this.state.colors.dark }
      : { ...this.state.colors.light };
    const hsl = [];

    // set i = 0 to start e.g. chart colors with ptimary color
    // set i = 1 to start with contrast color
    for (
      let i = 0;
      i <= Math.round(360 / this.state.colors.secondaryHueOffset);
      i++
    ) {
      hsl.push(
        `hsl(${color.primary.hue + i * this.state.colors.secondaryHueOffset}, ${
          color.primary.saturation
        }%, ${color.primary.luminance}%)`,
      );
    }
    return hsl;
  }

  // - API calls
  public async persistUiSettingsToFirestore(): Promise<void> {
    const userId = await firstValueFrom(
      this.auth.user$.pipe(map((u) => u?.uid)),
    );
    const uiSettings = this.state;
    if (userId && userId.length > 0) {
      return setDoc(this.getDocRef(userId), { uiSettings }, { merge: true });
    }
  }

  // Private
  private observeUserUiSettings(): Observable<UiSettingsState> {
    return this.user$.pipe(
      map((user) => user?.uid),
      switchMap((userId) =>
        userId ? this.observeUiSettingsFromFirestore(userId) : of(initialState),
      ),
    );
  }

  private observeUiSettingsFromFirestore(
    userId: string,
  ): Observable<UiSettingsState> {
    return docData(this.getDocRef(userId)).pipe(
      log('getStateFromFirestore', this.constructor.name),
      map((luxUser) => {
        if (!luxUser?.uiSettings) {
          throw new Error(
            `'observeUiSettingsFromFirestore' failed - user has no uiSettings.`,
          );
        }
        return luxUser.uiSettings;
      }),
      catchError((e) => {
        throw new Error(`'observeUiSettingsFromFirestore' failed.`);
      }),
    );
  }

  private getDocRef(userId: string): DocumentReference<LuxUser> {
    const colRef = collection(
      this.firestore,
      'user',
    ) as CollectionReference<LuxUser>;
    return doc(colRef, userId);
  }

  // - Online status methods
  private observeOnlineStatus(): Observable<boolean> {
    return merge(
      fromEvent(window, 'online'),
      fromEvent(window, 'offline'),
    ).pipe(
      map(() => navigator.onLine),
      share(),
      distinctUntilChanged(),
      startWith(navigator.onLine),
    );
  }

  // - Device orientation
  private observeDeviceOrientation(): Observable<'portrait' | 'landscape'> {
    if (
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )
    ) {
      // Do not listen for resize events, as the device is likely not a mobile
      return of('portrait');
    }
    return fromEvent(window, 'resize').pipe(
      map(() =>
        window.outerHeight > window.outerWidth ? 'portrait' : 'landscape',
      ),
      startWith<'portrait' | 'landscape'>(
        window.outerHeight > window.outerWidth ? 'portrait' : 'landscape',
      ),
    );
  }

  // - Dark mode methods
  private observeOsDarkMode(): Observable<boolean> {
    return fromEventPattern<MediaQueryList>((handler) =>
      this.matchMedia.addEventListener('change', handler),
    ).pipe(
      map((v) => v.matches),
      startWith<boolean>(this.matchMedia.matches),
    );
  }

  private observeDarkMode(): Observable<boolean> {
    return combineLatest([
      this.select((state) => state.appUsesOsDarkMode),
      this.select((state) => state.appDarkMode),
      this.observeOsDarkMode(),
    ]).pipe(
      map(([appUsesOsDarkMode, appDarkMode, osDarkMode]) =>
        appUsesOsDarkMode ? osDarkMode : appDarkMode,
      ),
    );
  }

  private changeDarkModeCssClass(toggle: boolean): void {
    if (toggle) {
      this.renderer.addClass(this.document.body, this.darkThemeClass);
    }
    if (!toggle) {
      this.renderer.removeClass(this.document.body, this.darkThemeClass);
    }
  }

  // - Modal methods
  private observeNumberOfOpenModals(): Observable<number> {
    return merge(
      fromEventPattern((handler) =>
        window.addEventListener('ionModalWillPresent', handler),
      ).pipe(map(() => 1)),
      fromEventPattern((handler) =>
        window.addEventListener('ionModalWillDismiss', handler),
      ).pipe(map(() => -1)),
      of(0),
    ).pipe(scan((acc, value) => acc + value, 0));
  }

  private changeStatusBarCssClass(count: number): void {
    try {
      if (count > 0) {
        this.renderer.removeClass(
          this.document.getElementById('ios-status-bar-bg'),
          this.statusBarClass,
        );
      }
      if (count <= 0) {
        this.renderer.addClass(
          this.document.getElementById('ios-status-bar-bg'),
          this.statusBarClass,
        );
      }
    } catch (error) {}
  }

  // - On screen keyboard methods
  private observeKeyboard(): Observable<number> {
    return merge(
      this.platform.keyboardDidShow.pipe(
        map((ev: KeyboardEventDetail) => ev.keyboardHeight),
      ) as Observable<number>,
      this.platform.keyboardDidHide.pipe(map(() => 0)),
    );
  }

  private setViewHeightCssProperty(keyboardHeight: number = 0): void {
    const platformVh = this.platform.height();
    // FIXME: keyboardHeight output from ionic's platform.keyboardDidShow is inconsistent
    const vh =
      keyboardHeight > 0 ? (1 - keyboardHeight / platformVh) * 100 : 100;
    this.document.documentElement.style.setProperty('--vh', `${vh}vh`);
  }

  // - Scroll methods
  private observeScroll(): Observable<number> {
    return fromEvent(window, 'scroll').pipe(map((e) => window.pageYOffset));
  }

  // - Color methods
  private observeColor(): Observable<UiSettingsState['colors']> {
    return this.select((state) => state.colors);
  }

  private changeColorsInCss(): void {
    this.domController.write(() => {
      // Light
      this.document.documentElement.style.setProperty(
        `--color-primary-light-h`,
        this.state.colors.light.primary.hue.toString(),
      );
      this.document.documentElement.style.setProperty(
        `--color-primary-light-s`,
        this.state.colors.light.primary.saturation + '%',
      );
      this.document.documentElement.style.setProperty(
        `--color-primary-light-l`,
        this.state.colors.light.primary.luminance + '%',
      );
      // Dark
      this.document.documentElement.style.setProperty(
        `--color-primary-dark-h`,
        this.state.colors.dark.primary.hue.toString(),
      );
      this.document.documentElement.style.setProperty(
        `--color-primary-dark-s`,
        this.state.colors.dark.primary.saturation + '%',
      );
      this.document.documentElement.style.setProperty(
        `--color-primary-dark-l`,
        this.state.colors.dark.primary.luminance + '%',
      );
      // Secondary Color Hue Offset
      this.document.documentElement.style.setProperty(
        `--color-secondary-h`,
        this.state.colors.secondaryHueOffset.toString(),
      );
    });
  }
}
