import { TestBed } from '@angular/core/testing';

import { TemplateChartInputStateService } from './template-chart-input-state.service';

describe('TemplateChartInputStateService', () => {
  let service: TemplateChartInputStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateChartInputStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
