import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CustompopupPage } from './custompopup.page';

describe('CustompopupPage', () => {
  let component: CustompopupPage;
  let fixture: ComponentFixture<CustompopupPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustompopupPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CustompopupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
