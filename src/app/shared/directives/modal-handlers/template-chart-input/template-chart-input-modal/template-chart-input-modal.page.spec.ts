import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TemplateChartInputModalPage } from './template-chart-input-modal.page';

describe('TemplateChartInputModalPage', () => {
  let component: TemplateChartInputModalPage;
  let fixture: ComponentFixture<TemplateChartInputModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), TemplateChartInputModalPage]
}).compileComponents();

    fixture = TestBed.createComponent(TemplateChartInputModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
