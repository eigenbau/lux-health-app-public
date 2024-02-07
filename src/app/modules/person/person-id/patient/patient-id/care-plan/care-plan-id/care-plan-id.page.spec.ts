import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CarePlanIdPage } from './care-plan-id.page';

describe('CarePlanIdPage', () => {
  let component: CarePlanIdPage;
  let fixture: ComponentFixture<CarePlanIdPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), CarePlanIdPage]
}).compileComponents();

    fixture = TestBed.createComponent(CarePlanIdPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
