import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root-redirect',
  template: '<div style="padding:2rem;text-align:center;">Redirecting to dashboard…</div>',
  standalone: true,
})
export class RootRedirectComponent implements OnInit {
  ngOnInit() {
    console.log('[RootRedirectComponent] ngOnInit called, hard redirecting to /dashboard');
    setTimeout(() => {
      location.replace('/dashboard');
    }, 0);
  }
}
