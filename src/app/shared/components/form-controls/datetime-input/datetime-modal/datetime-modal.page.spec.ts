import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DatetimeModalPage } from './datetime-modal.page';

describe('DatetimeModalPage', () => {
  let component: DatetimeModalPage;
  let fixture: ComponentFixture<DatetimeModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), DatetimeModalPage]
}).compileComponents();

    fixture = TestBed.createComponent(DatetimeModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
