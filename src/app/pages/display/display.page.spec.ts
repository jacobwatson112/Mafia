import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayPage } from './display.page';

describe('DisplayPage', () => {
  let component: DisplayPage;
  let fixture: ComponentFixture<DisplayPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
