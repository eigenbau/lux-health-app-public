import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ObservationCodePage } from './observation-code.page';

describe('ObservationCodePage', () => {
  let component: ObservationCodePage;
  let fixture: ComponentFixture<ObservationCodePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ObservationCodePage]
}).compileComponents();

    fixture = TestBed.createComponent(ObservationCodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
