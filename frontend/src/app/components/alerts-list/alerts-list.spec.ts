import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertsList } from './alerts-list';

describe('AlertsList', () => {
  let component: AlertsList;
  let fixture: ComponentFixture<AlertsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertsList],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
