import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PersonInputModalPage } from './person-input-modal.page';

describe('PersonInputModalPage', () => {
  let component: PersonInputModalPage;
  let fixture: ComponentFixture<PersonInputModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PersonInputModalPage]
}).compileComponents();

    fixture = TestBed.createComponent(PersonInputModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
