export interface UiSettingsState {
  deviceOrientation: 'portrait' | 'landscape';
  onlineStatus: boolean;
  appUsesOsDarkMode: boolean;
  appDarkMode: boolean;
  colors: {
    light: {
      primary: {
        hue: number;
        saturation: number;
        luminance: number;
      };
    };
    dark: {
      primary: {
        hue: number;
        saturation: number;
        luminance: number;
      };
    };
    secondaryHueOffset: number;
  };
}
