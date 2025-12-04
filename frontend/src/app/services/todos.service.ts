import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  due_at?: string | null;
  priority?: string | null;
  deleted_at?: string | null;
}

export interface TodoList {
  items: Todo[];
  total: number;
  limit?: number | null;
  offset?: number | null;
  next_cursor?: string | null;
  has_more?: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class TodosService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  list(params: {
    limit?: number;
    offset?: number;
    completed?: boolean;
    priority?: string;
    overdue?: boolean;
    sort_due?: boolean;
    include_deleted?: boolean;
    cursor?: string;
  } = {}): Observable<TodoList> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        httpParams = httpParams.set(k, String(v));
      }
    });
    return this.http.get<TodoList>(`${this.base}/todos/`, { params: httpParams });
  }

  get(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.base}/todos/${id}`);
  }

  create(body: Partial<Todo>): Observable<Todo> {
    return this.http.post<Todo>(`${this.base}/todos/`, body);
  }

  update(id: number, body: Partial<Todo>): Observable<Todo> {
    return this.http.put<Todo>(`${this.base}/todos/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/todos/${id}`);
  }

  restore(id: number): Observable<Todo> {
    return this.http.post<Todo>(`${this.base}/todos/${id}/restore`, {});
  }
}
