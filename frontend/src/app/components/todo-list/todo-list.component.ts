import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodosService, Todo, TodoList } from '../../services/todos.service';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  loading = false;
  error: string | null = null;

  // Quick add
  quickAddTitle = '';
  quickAddLoading = false;
  quickAddError: string | null = null;
  // Snackbar state
  showSnackbar: boolean = false;
  snackbarMessage: string = '';

  // filters
  showCompleted: boolean | undefined = undefined;
  priority: string | undefined = undefined;
  overdue: boolean | undefined = undefined;
  includeDeleted: boolean | undefined = undefined;
  sortDue: boolean | undefined = undefined;

  // pagination
  limit = 10;
  offset = 0;
  nextCursor: string | null = null;
  hasMore: boolean | null = null;

  constructor(private todosService: TodosService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(cursor?: string) {
    this.loading = true;
    this.error = null;
    const params = {
      limit: this.limit,
      offset: cursor ? undefined : this.offset,
      completed: this.showCompleted,
      priority: this.priority,
      overdue: this.overdue,
      include_deleted: this.includeDeleted,
      sort_due: this.sortDue,
      cursor: cursor,
    };
    this.todosService.list(params).subscribe({
      next: (list: TodoList) => {
        this.todos = list.items ?? [];
        this.nextCursor = list.next_cursor ?? null;
        this.hasMore = list.has_more ?? null;
        this.loading = false;
        try { this.cdr.detectChanges(); } catch {}
      },
      error: (err) => {
        this.error = err.message || 'Failed to load todos';
        this.loading = false;
        try { this.cdr.detectChanges(); } catch {}
      },
    });
  }

  async quickAdd() {
    this.quickAddError = null;
    if (!this.quickAddTitle.trim()) {
      this.quickAddError = 'Title required';
      return;
    }
    this.quickAddLoading = true;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (environment.apiKey) headers['X-API-Key'] = environment.apiKey;
      const res = await fetch('/api/todos/', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: this.quickAddTitle.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      this.quickAddTitle = '';
      this.fetch();
      this.showSnackbarMessage('Todo added!');
    } catch (e: any) {
      this.quickAddError = e?.message || 'Failed to add todo';
    } finally {
      this.quickAddLoading = false;
    }
  }

  showSnackbarMessage(msg: string) {
    this.snackbarMessage = msg;
    this.showSnackbar = true;
    setTimeout(() => {
      this.showSnackbar = false;
    }, 2200);
  }

  toggleComplete(todo: Todo) {
    this.todosService.update(todo.id, { completed: !todo.completed }).subscribe({
      next: (updated) => {
        todo.completed = updated.completed;
      },
      error: (err) => (this.error = err.message || 'Failed to update todo'),
    });
  }

  delete(todo: Todo) {
    this.todosService.delete(todo.id).subscribe({
      next: () => this.fetch(),
      error: (err) => (this.error = err.message || 'Failed to delete todo'),
    });
  }

  restore(todo: Todo) {
    this.todosService.restore(todo.id).subscribe({
      next: () => this.fetch(),
      error: (err) => (this.error = err.message || 'Failed to restore todo'),
    });
  }

  nextPage() {
    if (this.nextCursor) this.fetch(this.nextCursor);
  }

  prevPage() {
    // Fallback to offset paging for previous; simple UX
    if (this.offset - this.limit >= 0) {
      this.offset -= this.limit;
      this.fetch();
    }
  }

  isOverdue(t: Todo): boolean {
    if (!t.due_at) return false;
    const due = new Date(t.due_at).getTime();
    return Date.now() > due;
  }
}
