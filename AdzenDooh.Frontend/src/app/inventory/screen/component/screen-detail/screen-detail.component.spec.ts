import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenDetailComponent } from './screen-detail.component';

describe('ScreenDetailComponent', () => {
  let component: ScreenDetailComponent;
  let fixture: ComponentFixture<ScreenDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
