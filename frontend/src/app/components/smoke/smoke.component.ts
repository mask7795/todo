import { Component } from '@angular/core';

@Component({
  selector: 'app-smoke',
  standalone: true,
  template: `
    <div style="padding:2rem;text-align:center;background:#eef;border:1px solid #99c;">
      <strong>[SMOKE]</strong> Route rendered successfully.
    </div>
  `,
})
export class SmokeComponent {}
