import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PersonButtonComponent } from './person-button.component';

describe('PersonButtonComponent', () => {
  let component: PersonButtonComponent;
  let fixture: ComponentFixture<PersonButtonComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PersonButtonComponent]
}).compileComponents();

      fixture = TestBed.createComponent(PersonButtonComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
