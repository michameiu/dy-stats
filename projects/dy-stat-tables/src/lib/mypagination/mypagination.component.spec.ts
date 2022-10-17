import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MypaginationComponent } from './mypagination.component';

describe('MypaginationComponent', () => {
  let component: MypaginationComponent;
  let fixture: ComponentFixture<MypaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MypaginationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MypaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
