import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TodosService } from '../../services/todos.service';

@Component({
  selector: 'app-todo-form',
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TodoFormComponent {
  title = '';
  due_at: string | null = null;
  priority: string | null = null;
  error: string | null = null;

  constructor(private todos: TodosService) {}

  submit() {
    if (!this.title.trim()) {
      this.error = 'Title is required';
      return;
    }
    this.error = null;
    this.todos
      .create({ title: this.title, completed: false, due_at: this.due_at, priority: this.priority })
      .subscribe({
        next: () => {
          this.title = '';
          this.due_at = null;
          this.priority = null;
        },
        error: (err) => (this.error = err.message || 'Failed to create todo'),
      });
  }
}
