import { Routes } from '@angular/router';
import { SplashComponent } from './splash/splash.component';
import { DropshippingComponent } from './dropshipping/dropshipping.component';

export const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'home', component: DropshippingComponent }
];
