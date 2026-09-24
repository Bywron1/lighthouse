<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Working rules

- Before changing behaviour, write a failing test that shows the change is needed.
- Before saying a change is done, run the tests (`npm test`), the linter (`npm run lint`) and the type check (`npx tsc --noEmit`).
- If any check fails, do not push.
- Commit after each small change.
- Ask before adding a library.
- Before pushing, run the app locally and wait for the user to check it.
