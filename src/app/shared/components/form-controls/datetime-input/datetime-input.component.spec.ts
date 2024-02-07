import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DatetimeInputComponent } from './datetime-input.component';

describe('DatetimeInputComponent', () => {
  let component: DatetimeInputComponent;
  let fixture: ComponentFixture<DatetimeInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), DatetimeInputComponent]
}).compileComponents();

    fixture = TestBed.createComponent(DatetimeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
