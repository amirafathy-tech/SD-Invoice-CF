import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './auth/auth.guard';
import { ServiceInvoiceComponent } from './service-invoice/service-invoice.component';


const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'login', component: AuthComponent },
  { path: 'service-invoice',canActivate:[AuthGuard], component: ServiceInvoiceComponent }
  //data: { role: ['Admin', 'Manager'] } // for auth role:
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }