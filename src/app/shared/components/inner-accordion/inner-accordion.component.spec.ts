import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InnerAccordionComponent } from './inner-accordion.component';

describe('InnerAccordionComponent', () => {
  let component: InnerAccordionComponent;
  let fixture: ComponentFixture<InnerAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InnerAccordionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InnerAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
