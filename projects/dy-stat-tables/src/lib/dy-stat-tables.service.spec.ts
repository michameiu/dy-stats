import { TestBed } from '@angular/core/testing';

import { DyStatTablesService } from './dy-stat-tables.service';

describe('DyStatTablesService', () => {
  let service: DyStatTablesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DyStatTablesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
