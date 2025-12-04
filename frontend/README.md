# TodoFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Testing

Run unit tests for services and components:

```zsh
cd frontend
ng test
```

What’s covered:
- TodosService: list URL construction (filters, cursor) and create POST.
- TodoListComponent: init load, toggle complete, delete, restore, filters, cursor.
- TodoFormComponent: validation and create request body.

## E2E Smoke (Playwright)

This project includes a lightweight Playwright smoke test that boots the Angular dev server with the dev proxy and exercises the backend via the UI.

Prereqs:
- Backend running locally (FastAPI):
	```zsh
	uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
	```
- Node environment with Angular CLI installed (`ng`).
- Playwright installed in the frontend workspace:
	```zsh
	cd frontend
	npm i -D @playwright/test
	npx playwright install
	```

Run the smoke test:
```zsh
cd frontend
export TODO_API_KEY=secret # match backend key
npx playwright test
```

Files:
- `playwright.config.ts`: Runs `ng serve` with `proxy.conf.json` and points tests at `http://localhost:4200`.
- `tests-e2e/smoke.spec.ts`: Seeds a todo via API (uses `TODO_API_KEY`) and verifies it appears in the UI.

## Navigation & Dashboard

- Top menu with links to `Dashboard` and `Todos`.
- `Dashboard` shows summary stats: total, completed, deleted, overdue.
- Routes defined in `src/app/app.routes.ts`; router provided in `src/main.ts`.

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
