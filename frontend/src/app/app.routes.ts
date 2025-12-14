import { Routes } from '@angular/router';
import { RootRedirectComponent } from './root-redirect.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { SmokeComponent } from './components/smoke/smoke.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'todos', component: TodoListComponent },
  { path: '__smoke', component: SmokeComponent },
  { path: '**', component: RootRedirectComponent },
];
