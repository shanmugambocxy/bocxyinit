import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountsettingsPageRoutingModule } from './accountsettings-routing.module';

import { AccountsettingsPage } from './accountsettings.page';
import { Ng2TelInputModule } from 'ng2-tel-input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccountsettingsPageRoutingModule,
    ReactiveFormsModule,
    Ng2TelInputModule
  ],
  declarations: [AccountsettingsPage]
})
export class AccountsettingsPageModule {}
