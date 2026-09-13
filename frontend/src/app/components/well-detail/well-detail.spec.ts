import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WellDetail } from './well-detail';

describe('WellDetail', () => {
  let component: WellDetail;
  let fixture: ComponentFixture<WellDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WellDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(WellDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
