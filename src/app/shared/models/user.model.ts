import { User } from 'firebase/auth';
import { UiSettingsState } from './ui-settings.model';

export interface UserRoles {
  [key: string]: string | object | undefined | boolean;
  admin: boolean;
  editor: boolean;
}

export interface LuxUser extends Partial<User> {
  uiSettings: UiSettingsState;
}
