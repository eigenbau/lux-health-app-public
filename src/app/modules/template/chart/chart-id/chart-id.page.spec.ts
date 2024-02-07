import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChartIdPage } from './chart-id.page';

describe('ChartIdPage', () => {
  let component: ChartIdPage;
  let fixture: ComponentFixture<ChartIdPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ChartIdPage]
}).compileComponents();

    fixture = TestBed.createComponent(ChartIdPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
