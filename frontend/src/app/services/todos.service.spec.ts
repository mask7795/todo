import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TodosService, TodoList, Todo } from './todos.service';
import { environment } from '../../environments/environment';

describe('TodosService', () => {
  let service: TodosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TodosService],
    });
    service = TestBed.inject(TodosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list todos', () => {
    const mock: TodoList = { items: [], total: 0, limit: 10, offset: 0, next_cursor: null, has_more: false };
    service.list({ limit: 10, offset: 0 }).subscribe((res) => {
      expect(res.total).toBe(0);
      expect(res.items.length).toBe(0);
    });
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/todos/?limit=10&offset=0`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('should create a todo', () => {
    const created: Todo = { id: 1, title: 'x', completed: false };
    service.create({ title: 'x' }).subscribe((res) => {
      expect(res.id).toBe(1);
      expect(res.title).toBe('x');
    });
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/todos/`);
    expect(req.request.method).toBe('POST');
    req.flush(created);
  });

  it('builds list URL with filters', () => {
    service.list({ limit: 5, offset: 10, priority: 'high', overdue: true, sort_due: true }).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/todos/?limit=5&offset=10&priority=high&overdue=true&sort_due=true`);
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], total: 0 });
  });

  it('uses cursor param when provided', () => {
    service.list({ limit: 5, cursor: '12' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/todos/?limit=5&cursor=12`);
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], total: 0 });
  });
});
