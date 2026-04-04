import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { SouthernGrovesLayoutComponent } from './southern-groves-layout/southern-groves-layout.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { animation: 'LoginPage' } },
  { path: 'signup', component: SignupComponent, data: { animation: 'SignupPage' } },
  { path: 'home', component: SouthernGrovesLayoutComponent, data: { animation: 'HomePage' } },
  { path: 'profile', component: UserProfileComponent, data: { animation: 'ProfilePage' } }
];
