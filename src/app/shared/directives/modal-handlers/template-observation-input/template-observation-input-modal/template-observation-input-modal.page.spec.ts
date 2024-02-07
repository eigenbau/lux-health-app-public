import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TemplateObservationInputModalPage } from './template-observation-input-modal.page';

describe('TemplateObservationInputModalPage', () => {
  let component: TemplateObservationInputModalPage;
  let fixture: ComponentFixture<TemplateObservationInputModalPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), TemplateObservationInputModalPage]
}).compileComponents();

      fixture = TestBed.createComponent(TemplateObservationInputModalPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
