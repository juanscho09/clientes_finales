import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MechanicalAssistanceComponent } from './mechanical-assistance.component';

describe('MechanicalAssistanceComponent', () => {
  let component: MechanicalAssistanceComponent;
  let fixture: ComponentFixture<MechanicalAssistanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MechanicalAssistanceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MechanicalAssistanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
