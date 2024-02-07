import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SearchPersonModalPage } from './search-person-modal.page';

describe('SearchPersonModalPage', () => {
  let component: SearchPersonModalPage;
  let fixture: ComponentFixture<SearchPersonModalPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), SearchPersonModalPage]
}).compileComponents();

      fixture = TestBed.createComponent(SearchPersonModalPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
