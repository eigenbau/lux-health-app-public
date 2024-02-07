import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ObservationIdPage } from './observation-id.page';

describe('ObservationIdPage', () => {
  let component: ObservationIdPage;
  let fixture: ComponentFixture<ObservationIdPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ObservationIdPage]
}).compileComponents();

    fixture = TestBed.createComponent(ObservationIdPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
