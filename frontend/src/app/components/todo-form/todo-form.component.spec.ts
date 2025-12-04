import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TodoFormComponent } from './todo-form.component';
import { TodosService } from '../../services/todos.service';
import { environment } from '../../../environments/environment';

describe('TodoFormComponent', () => {
  let component: TodoFormComponent;
  let fixture: ComponentFixture<TodoFormComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TodoFormComponent],
      providers: [TodosService],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requires title', () => {
    component.title = '';
    component.submit();
    expect(component.error).toBe('Title is required');
  });

  it('posts create with body', () => {
    component.title = 'New task';
    component.priority = 'high';
    component.due_at = '2025-12-05T12:00';
    component.submit();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/todos/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'New task', completed: false, due_at: '2025-12-05T12:00', priority: 'high' });
    req.flush({ id: 1, title: 'New task', completed: false });
    expect(component.error).toBeNull();
    expect(component.title).toBe('');
    expect(component.priority).toBeNull();
    expect(component.due_at).toBeNull();
  });
});
