import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodosService, Todo, TodoList } from '../../services/todos.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  loading = true;
  errorMessage: string | null = null;
  lastStatus: string | null = null;
  total = 0;
  completed = 0;
  deleted = 0;
  overdue = 0;

  constructor(private todos: TodosService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    console.log('[Dashboard] ngOnInit called');
    try {
      let items: Todo[] = [];
      let cursor: string | undefined = undefined;
      let safety = 0;
      // Paginate to aggregate beyond 200 safely
      while (safety < 50) {
        console.log(`[Dashboard] Fetching todos page ${safety + 1} with cursor`, cursor);
        const res: TodoList = await firstValueFrom(
          this.todos.list({ include_deleted: true, limit: 200, cursor })
        );
        console.log('[Dashboard] API response:', res);
        if (!res || !Array.isArray(res.items)) {
          console.error('[Dashboard] List response invalid', res);
          throw new Error('List response invalid');
        }
        this.lastStatus = `page=${safety + 1} count=${res.items?.length ?? 0} has_more=${!!res.has_more}`;
        items = items.concat(res.items ?? []);
        if (res.has_more && res.next_cursor) {
          cursor = res.next_cursor || undefined;
          safety += 1;
        } else {
          break;
        }
      }
      this.total = items.length;
      this.completed = items.filter(t => t.completed).length;
      this.deleted = items.filter(t => !!t.deleted_at).length;
      const now = new Date();
      this.overdue = items.filter(t => !!t.due_at && new Date(t.due_at) < now && !t.completed && !t.deleted_at).length;
      console.log('[Dashboard] Aggregation complete', {
        total: this.total,
        completed: this.completed,
        deleted: this.deleted,
        overdue: this.overdue
      });
    } catch (err) {
      console.error('[Dashboard] Failed to load', err);
      this.errorMessage = 'Failed to load dashboard';
    } finally {
      this.loading = false;
      console.log('[Dashboard] Loading set to false');
      // Ensure change detection runs in case async work occurred outside zone
      try { this.cdr.detectChanges(); } catch {}
    }
  }
}
