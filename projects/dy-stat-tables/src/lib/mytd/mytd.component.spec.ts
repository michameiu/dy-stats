import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MytdComponent } from './mytd.component';

describe('MytdComponent', () => {
  let component: MytdComponent;
  let fixture: ComponentFixture<MytdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MytdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MytdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
