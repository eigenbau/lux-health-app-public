import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PersonBundleFormGroupComponent } from './person-bundle-form-group.component';

describe('PersonBundleFormGroupComponent', () => {
  let component: PersonBundleFormGroupComponent;
  let fixture: ComponentFixture<PersonBundleFormGroupComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PersonBundleFormGroupComponent]
}).compileComponents();

      fixture = TestBed.createComponent(PersonBundleFormGroupComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
