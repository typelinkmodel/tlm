# @typelinkmodel/tlm-web

Web interface for the Type Link Model (TLM) project.

## Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Testing

Run Playwright integration tests:

```bash
pnpm test
```

Run tests with UI mode (interactive):

```bash
pnpm test:ui
```

Run tests in headed mode (see the browser):

```bash
pnpm test:headed
```

See [e2e/README.md](./e2e/README.md) for more details on end-to-end testing.

## Building

Build for production:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- TypeScript - Type safety
- React 19 - UI library
- [Playwright](https://playwright.dev) - E2E testing

## Project Structure

```
src/
├── app/          # Next.js app directory
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
└── ...
```
