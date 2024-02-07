import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PractitionerIdentifierComponent } from './practitioner-identifier.component';

describe('PractitionerIdentifierComponent', () => {
  let component: PractitionerIdentifierComponent;
  let fixture: ComponentFixture<PractitionerIdentifierComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PractitionerIdentifierComponent]
}).compileComponents();

      fixture = TestBed.createComponent(PractitionerIdentifierComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
