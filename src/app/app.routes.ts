import { Routes } from '@angular/router';
import { Login } from './account/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { UserFlow } from './pages/user-flow/user-flow';

export const routes: Routes = [
    { path: '', component: Login, data: {hideLayout: true}},
    { path: 'dashboard', component: Dashboard, data: {hideLayout: false}},
    { path: 'user-flow', component: UserFlow}
];
