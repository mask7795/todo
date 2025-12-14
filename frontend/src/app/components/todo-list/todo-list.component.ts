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

  quickAdd() {
    this.quickAddError = null;
    if (!this.quickAddTitle.trim()) {
      this.quickAddError = 'Title required';
      return;
    }
    this.quickAddLoading = true;

    this.todosService.create({ title: this.quickAddTitle.trim() }).subscribe({
      next: (created) => {
        this.quickAddTitle = '';
        // Fetch a larger window to compute the index/page of the created item.
        this.todosService.list({ limit: 50 }).subscribe({
          next: (list) => {
            const idx = (list.items || []).findIndex((it) => it.id === created.id);
            if (idx >= 0) {
              const page = Math.floor(idx / this.limit);
              this.offset = page * this.limit;
            } else {
              this.offset = 0;
            }
            // Refresh current page and then attempt to scroll/highlight the created element.
            this.fetch();
            this.showSnackbarMessage('Todo added!');
            setTimeout(() => {
              try {
                const el = document.getElementById(`todo-${created.id}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el.classList.add('highlight');
                  setTimeout(() => el.classList.remove('highlight'), 2500);
                }
              } catch (e) {
                // ignore DOM errors
              }
            }, 400);
            this.quickAddLoading = false;
          },
          error: () => {
            // Fallback: refresh current page
            this.fetch();
            this.showSnackbarMessage('Todo added!');
            this.quickAddLoading = false;
          },
        });
      },
      error: (err) => {
        this.quickAddError = err?.message || 'Failed to add todo';
        this.quickAddLoading = false;
      },
    });
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
