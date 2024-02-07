import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EncounterIdPage } from './encounter-id.page';

describe('EncounterIdPage', () => {
  let component: EncounterIdPage;
  let fixture: ComponentFixture<EncounterIdPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), EncounterIdPage]
}).compileComponents();

    fixture = TestBed.createComponent(EncounterIdPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
