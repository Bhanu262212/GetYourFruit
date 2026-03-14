import { Routes } from '@angular/router';
import { SplashComponent } from './splash/splash.component';
import { DropshippingComponent } from './dropshipping/dropshipping.component';
import { CartComponent } from './cart/cart.component';

export const routes: Routes = [
  { path: '', component: SplashComponent, data: { animation: 'SplashPage' } },
  { path: 'home', component: DropshippingComponent, data: { animation: 'HomePage' } },
  { path: 'cart', component: CartComponent, data: { animation: 'CartPage' } }
];
