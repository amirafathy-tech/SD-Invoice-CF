import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './auth/auth.guard';
import { ServiceInvoiceComponent } from './service-invoice/service-invoice.component';
import { HomePageComponent } from './home-page/home-page.component';
import { CloudDataComponent } from './cloud-data/cloud-data.component';


const routes: Routes = [
   { path: '', component: HomePageComponent },
  // { path: '', redirectTo: '/home', pathMatch: 'full' }, 
  { path: 'home', component: HomePageComponent },
  { path: 'login', component: AuthComponent },
  { path: 'service-invoice',canActivate:[AuthGuard], component: ServiceInvoiceComponent },
  
  { path: 'service-invoice-data',canActivate:[AuthGuard], component: CloudDataComponent },
  //data: { role: ['Admin', 'Manager'] } // for auth role:
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
