import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CustomerbillpagePage } from './customerbillpage.page';

describe('CustomerbillpagePage', () => {
  let component: CustomerbillpagePage;
  let fixture: ComponentFixture<CustomerbillpagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerbillpagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerbillpagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
