import { TestBed } from '@angular/core/testing';

import { TemplateObservationStateService } from './template-observation-state.service';

describe('TemplateObservationStateService', () => {
  let service: TemplateObservationStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateObservationStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
