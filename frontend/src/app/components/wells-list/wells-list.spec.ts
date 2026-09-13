import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WellsList } from './wells-list';

describe('WellsList', () => {
  let component: WellsList;
  let fixture: ComponentFixture<WellsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WellsList],
    }).compileComponents();

    fixture = TestBed.createComponent(WellsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
