import { TestBed } from '@angular/core/testing';

import { PatientEncounterStateService } from './patient-encounter-state.service';

describe('PatientEncounterStateService', () => {
  let service: PatientEncounterStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientEncounterStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
