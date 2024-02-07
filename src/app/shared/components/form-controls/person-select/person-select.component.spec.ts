import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PersonSelectComponent } from './person-select.component';

describe('PersonSelectComponent', () => {
  let component: PersonSelectComponent;
  let fixture: ComponentFixture<PersonSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PersonSelectComponent]
}).compileComponents();

    fixture = TestBed.createComponent(PersonSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
