import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TelecomComponent } from './telecom.component';

describe('TelecomComponent', () => {
  let component: TelecomComponent;
  let fixture: ComponentFixture<TelecomComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), TelecomComponent]
}).compileComponents();

    fixture = TestBed.createComponent(TelecomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
