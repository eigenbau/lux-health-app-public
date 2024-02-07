import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EncounterPage } from './encounter.page';

describe('EncounterPage', () => {
  let component: EncounterPage;
  let fixture: ComponentFixture<EncounterPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), EncounterPage]
}).compileComponents();

    fixture = TestBed.createComponent(EncounterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
