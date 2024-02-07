import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ValueSetSearchModalPage } from './value-set-search-modal.page';

describe('ValueSetSearchModalPage', () => {
  let component: ValueSetSearchModalPage;
  let fixture: ComponentFixture<ValueSetSearchModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ValueSetSearchModalPage]
}).compileComponents();

    fixture = TestBed.createComponent(ValueSetSearchModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
