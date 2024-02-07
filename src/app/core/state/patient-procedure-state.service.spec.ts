import { TestBed } from '@angular/core/testing';

import { PatientProcedureStateService } from './patient-procedure-state.service';

describe('PatientProcedureStateService', () => {
  let service: PatientProcedureStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientProcedureStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
