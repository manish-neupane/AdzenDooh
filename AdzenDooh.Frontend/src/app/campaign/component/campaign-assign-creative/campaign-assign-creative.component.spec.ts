import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignAssignMediaComponent } from './campaign-assign-creative.component';

describe('CampaignAssignMediaComponent', () => {
  let component: CampaignAssignMediaComponent;
  let fixture: ComponentFixture<CampaignAssignMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignAssignMediaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignAssignMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
