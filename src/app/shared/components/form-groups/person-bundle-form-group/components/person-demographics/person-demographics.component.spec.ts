import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PersonDemographicsComponent } from './person-demographics.component';

describe('PersonDemographicsComponent', () => {
  let component: PersonDemographicsComponent;
  let fixture: ComponentFixture<PersonDemographicsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PersonDemographicsComponent]
}).compileComponents();

    fixture = TestBed.createComponent(PersonDemographicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
