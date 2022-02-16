import { TestBed } from '@angular/core/testing';

import { MongooseService } from './mongoose.service';

describe('MongooseService', () => {
  let service: MongooseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MongooseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
