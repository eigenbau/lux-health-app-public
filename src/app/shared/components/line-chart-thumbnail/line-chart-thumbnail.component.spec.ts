import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LineChartThumbnailComponent } from './line-chart-thumbnail.component';

describe('LineChartThumbnailComponent', () => {
  let component: LineChartThumbnailComponent;
  let fixture: ComponentFixture<LineChartThumbnailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), LineChartThumbnailComponent]
}).compileComponents();

    fixture = TestBed.createComponent(LineChartThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
