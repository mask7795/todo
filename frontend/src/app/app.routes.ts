import { Routes } from '@angular/router';
import { RootRedirectComponent } from './root-redirect.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'todos', component: TodoListComponent },
  { path: '**', component: RootRedirectComponent },
];
