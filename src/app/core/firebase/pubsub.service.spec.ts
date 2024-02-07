import { TestBed } from '@angular/core/testing';

import { PubSubService } from './pub-sub.service';

describe('PubSubService', () => {
  let service: PubSubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PubSubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
