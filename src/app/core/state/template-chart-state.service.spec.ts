import { TestBed } from '@angular/core/testing';

import { TemplateChartStateService } from './template-chart-state.service';

describe('TemplateChartStateService', () => {
  let service: TemplateChartStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateChartStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
