import { TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { CommonModule } from '@angular/common';
import { TodosService, TodoList, Todo } from '../../services/todos.service';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let mockService: Partial<TodosService>;

  const sample: Todo[] = [
    { id: 1, title: 'a', completed: false, due_at: null, priority: 'low', deleted_at: null },
    { id: 2, title: 'b', completed: true, due_at: null, priority: 'medium', deleted_at: null },
    { id: 3, title: 'c', completed: false, due_at: '2000-01-01T00:00:00', priority: 'high', deleted_at: null },
    { id: 4, title: 'd', completed: false, due_at: null, priority: null, deleted_at: '2024-01-01T00:00:00' },
  ];
  const list: TodoList = { items: sample, total: sample.length };

  beforeEach(async () => {
    mockService = {
      list: () => of(list)
    } as unknown as TodosService;

    await TestBed.configureTestingModule({
      imports: [CommonModule, DashboardComponent],
      providers: [{ provide: TodosService, useValue: mockService }],
    }).compileComponents();
  });

  it('computes summary counts and toggles loading', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const comp = fixture.componentInstance;

    expect(comp.loading).toBe(true);
    await comp.ngOnInit();
    fixture.detectChanges();

    expect(comp.loading).toBe(false);
    expect(comp.total).toBe(4);
    expect(comp.completed).toBe(1);
    expect(comp.deleted).toBe(1);
    expect(comp.overdue).toBe(1);

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Dashboard');
    expect(el.textContent).toContain('Total');
    expect(el.textContent).toContain('Completed');
    expect(el.textContent).toContain('Deleted');
    expect(el.textContent).toContain('Overdue');
  });
});
