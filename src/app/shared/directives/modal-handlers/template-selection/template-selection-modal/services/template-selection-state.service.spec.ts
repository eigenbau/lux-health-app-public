import { TestBed } from '@angular/core/testing';

import { TemplateSelectionStateService } from './template-selection-state.service';

describe('TemplateSelectionStateService', () => {
  let service: TemplateSelectionStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateSelectionStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
