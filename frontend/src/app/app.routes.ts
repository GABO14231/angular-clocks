import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {Home} from './pages/Home/Home';
import {LoginPage} from './pages/Login/Login';
import {RegisterPage} from './pages/Register/Register';
import {ProfilePage} from './pages/Profile/Profile';
import {DeleteProfilePage} from './pages/DeleteProfile/DeleteProfile';
import {RecoverPasswordPage} from './pages/RecoverPassword/RecoverPassword';
import {ClockDashboardPage} from './pages/ClockDashboard/ClockDashboard';
import {AuthGuard} from './guards/AuthGuard';
import {LoginGuard} from './guards/LoginGuard';

export const routes: Routes =
[
    {path: '', component: Home},
    {path: 'login', component: LoginPage, canActivate: [LoginGuard]},
    {path: 'register', component: RegisterPage, canActivate: [LoginGuard]},
    {path: 'profile', component: ProfilePage, canActivate: [AuthGuard]},
    {path: 'delprofile', component: DeleteProfilePage, canActivate: [AuthGuard]},
    {path: 'recoverpass', component: RecoverPasswordPage},
    {path: 'dashboard', component: ClockDashboardPage, canActivate: [AuthGuard]},
];

@NgModule({imports: [RouterModule.forRoot(routes)], exports: [RouterModule]})
export class AppRoutingModule {}