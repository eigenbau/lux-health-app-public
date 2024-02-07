import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TemplateObservationFormGroupComponent } from './template-observation-form-group.component';

describe('TemplateObservationFormGroupComponent', () => {
  let component: TemplateObservationFormGroupComponent;
  let fixture: ComponentFixture<TemplateObservationFormGroupComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), TemplateObservationFormGroupComponent]
}).compileComponents();

      fixture = TestBed.createComponent(TemplateObservationFormGroupComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
