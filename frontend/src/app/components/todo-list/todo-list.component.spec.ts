import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TodoListComponent } from './todo-list.component';
import { TodosService, TodoList } from '../../services/todos.service';
import { environment } from '../../../environments/environment';

describe('TodoListComponent', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TodoListComponent],
      providers: [TodosService],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads list on init', () => {
    const mock: TodoList = { items: [], total: 0, limit: 10, offset: 0, next_cursor: null, has_more: false };
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/todos/?limit=10&offset=0`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
    expect(component.todos.length).toBe(0);
  });

  it('toggles complete', () => {
    // Seed with one todo
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiBaseUrl}/todos/?limit=10&offset=0`).flush({ items: [], total: 0 });
    const todo = { id: 42, title: 't', completed: false };
    component.todos = [todo as any];
    component.toggleComplete(todo as any);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/todos/42`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.completed).toBe(true);
    req.flush({ id: 42, title: 't', completed: true });
    expect(component.todos[0].completed).toBe(true);
  });

  it('deletes a todo', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiBaseUrl}/todos/?limit=10&offset=0`).flush({ items: [], total: 0 });
    const todo = { id: 7, title: 'x', completed: false };
    component.delete(todo as any);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/todos/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    // delete triggers a refresh fetch
    const refetch = httpMock.expectOne(`${environment.apiBaseUrl}/todos/?limit=10&offset=0`);
    expect(refetch.request.method).toBe('GET');
    refetch.flush({ items: [], total: 0 });
  });

  it('restores a todo', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiBaseUrl}/todos/?limit=10&offset=0`).flush({ items: [], total: 0 });
    const todo = { id: 8, title: 'x', completed: false };
    component.restore(todo as any);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/todos/8/restore`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 8, title: 'x', completed: false });
    // restore triggers a refresh fetch
    const refetch = httpMock.expectOne(`${environment.apiBaseUrl}/todos/?limit=10&offset=0`);
    expect(refetch.request.method).toBe('GET');
    refetch.flush({ items: [], total: 0 });
  });
})
