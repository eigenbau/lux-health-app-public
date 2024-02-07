import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RelatedPersonComponent } from './related-person.component';

describe('RelatedPersonComponent', () => {
  let component: RelatedPersonComponent;
  let fixture: ComponentFixture<RelatedPersonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), RelatedPersonComponent]
}).compileComponents();

    fixture = TestBed.createComponent(RelatedPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
