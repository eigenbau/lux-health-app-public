import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EncounterItemComponent } from './encounter-item.component';

describe('EncounterItemComponent', () => {
  let component: EncounterItemComponent;
  let fixture: ComponentFixture<EncounterItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), EncounterItemComponent]
}).compileComponents();

    fixture = TestBed.createComponent(EncounterItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
