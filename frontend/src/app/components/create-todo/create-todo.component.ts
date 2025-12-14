import { Component, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-todo',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-todo.component.html',
})
export class CreateTodoComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loading = false;
  error: string | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    priority: ['medium'],
    due_date: [''],
  });

  async submit() {
    this.error = null;
    if (this.form.invalid) {
      this.error = 'Please fill in the required fields.';
      return;
    }
    this.loading = true;
    try {
      // Post to backend directly; service layer can replace this later
      const body = {
        title: this.form.value.title,
        description: this.form.value.description || undefined,
        priority: this.form.value.priority,
        due_date: this.form.value.due_date || undefined,
      };

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (environment.apiKey) {
        headers['X-API-Key'] = environment.apiKey;
      }
      const res = await fetch('/api/todos/', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }
      await this.router.navigateByUrl('/todos');
    } catch (e: any) {
      this.error = e?.message || 'Failed to create todo';
    } finally {
      this.loading = false;
    }
  }
}
