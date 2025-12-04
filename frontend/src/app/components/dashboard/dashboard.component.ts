import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodosService, Todo } from '../../services/todos.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  loading = true;
  total = 0;
  completed = 0;
  deleted = 0;
  overdue = 0;

  constructor(private todos: TodosService) {}

  async ngOnInit() {
    const res = await this.todos.list({ include_deleted: true, limit: 1000 });
    const items: Todo[] = res.items ?? res; // service may return array or paged
    this.total = items.length;
    this.completed = items.filter(t => t.completed).length;
    this.deleted = items.filter(t => !!t.deleted_at).length;
    const now = new Date();
    this.overdue = items.filter(t => !!t.due_at && new Date(t.due_at) < now && !t.completed && !t.deleted_at).length;
    this.loading = false;
  }
}
