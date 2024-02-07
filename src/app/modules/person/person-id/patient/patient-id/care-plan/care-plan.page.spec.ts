import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CarePlanPage } from './care-plan.page';

describe('CarePlanPage', () => {
  let component: CarePlanPage;
  let fixture: ComponentFixture<CarePlanPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), CarePlanPage]
}).compileComponents();

    fixture = TestBed.createComponent(CarePlanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
