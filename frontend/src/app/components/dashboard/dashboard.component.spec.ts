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

  it('requests include_deleted with limit 200', async () => {
    let calledParams: any = null;
    mockService = {
      list: (params: any) => {
        calledParams = params;
        // Simulate single page (no pagination)
        return of({ ...list, has_more: false, next_cursor: null });
      },
    } as unknown as TodosService;

    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CommonModule, DashboardComponent],
      providers: [{ provide: TodosService, useValue: mockService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardComponent);
    const comp = fixture.componentInstance;
    await comp.ngOnInit();
    expect(calledParams).toBeTruthy();
    expect(calledParams.include_deleted).toBe(true);
    expect(calledParams.limit).toBe(200);
  });

  it('paginates and aggregates across pages', async () => {
    // Create two pages: first with has_more and next_cursor, second final
    const page1: TodoList = {
      items: sample.slice(0, 2),
      total: 4,
      has_more: true,
      next_cursor: '2',
    };
    const page2: TodoList = {
      items: sample.slice(2),
      total: 4,
      has_more: false,
      next_cursor: null,
    };

    let calls: any[] = [];
    mockService = {
      list: (params: any) => {
        calls.push(params);
        if (!params.cursor) {
          return of(page1);
        }
        return of(page2);
      },
    } as unknown as TodosService;

    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CommonModule, DashboardComponent],
      providers: [{ provide: TodosService, useValue: mockService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardComponent);
    const comp = fixture.componentInstance;
    await comp.ngOnInit();
    expect(comp.total).toBe(4);
    expect(calls.length).toBeGreaterThan(1);
    expect(calls[0].limit).toBe(200);
    expect(calls[0].cursor).toBeUndefined();
    expect(calls[1].cursor).toBe('2');
  });
});
