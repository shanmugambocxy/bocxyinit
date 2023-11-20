import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddStoreProductPage } from './add-store-product.page';

describe('AddStoreProductPage', () => {
  let component: AddStoreProductPage;
  let fixture: ComponentFixture<AddStoreProductPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddStoreProductPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddStoreProductPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
