import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChartMenuButtonComponent } from './chart-menu-button.component';

describe('ChartMenuButtonComponent', () => {
  let component: ChartMenuButtonComponent;
  let fixture: ComponentFixture<ChartMenuButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ChartMenuButtonComponent]
}).compileComponents();

    fixture = TestBed.createComponent(ChartMenuButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
