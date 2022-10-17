import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DyStatTablesComponent } from './dy-stat-tables.component';

describe('DyStatTablesComponent', () => {
  let component: DyStatTablesComponent;
  let fixture: ComponentFixture<DyStatTablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DyStatTablesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DyStatTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
