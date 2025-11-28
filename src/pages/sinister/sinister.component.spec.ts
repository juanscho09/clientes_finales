import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SinisterComponent } from './sinister.component';

describe('SinisterComponent', () => {
  let component: SinisterComponent;
  let fixture: ComponentFixture<SinisterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SinisterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SinisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
