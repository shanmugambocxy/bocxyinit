import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CustomerTotalVisitPage } from './customer-total-visit.page';

describe('CustomerTotalVisitPage', () => {
  let component: CustomerTotalVisitPage;
  let fixture: ComponentFixture<CustomerTotalVisitPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerTotalVisitPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerTotalVisitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
