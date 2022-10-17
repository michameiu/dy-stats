import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MycelldisplayComponent } from './mycelldisplay.component';

describe('MycelldisplayComponent', () => {
  let component: MycelldisplayComponent;
  let fixture: ComponentFixture<MycelldisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MycelldisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MycelldisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
