import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChartPage } from './chart.page';

describe('ChartPage', () => {
  let component: ChartPage;
  let fixture: ComponentFixture<ChartPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ChartPage]
}).compileComponents();

    fixture = TestBed.createComponent(ChartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
