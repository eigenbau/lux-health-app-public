import { TestBed } from '@angular/core/testing';

import { UiSettingsStateService } from './ui-settings-state.service';

describe('UiSettingsStateService', () => {
  let service: UiSettingsStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiSettingsStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
