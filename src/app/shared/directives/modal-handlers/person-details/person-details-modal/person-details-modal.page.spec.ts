import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PersonDetailsModalPage } from './person-details-modal.page';

describe('PersonDetailsModalPage', () => {
  let component: PersonDetailsModalPage;
  let fixture: ComponentFixture<PersonDetailsModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PersonDetailsModalPage]
}).compileComponents();

    fixture = TestBed.createComponent(PersonDetailsModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
