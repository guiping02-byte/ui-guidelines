# GitHub Pages Migration Design

## Goal

Make GitHub Pages the only public home of the UI design-system board. Preserve
the current rendered board and browser-side interactions, automatically publish
changes pushed to GitHub, and permanently delete the former Sites project only
after the replacement is proven usable.

## Public Destination

- Repository: `https://github.com/guiping02-byte/ui-guidelines`
- Default branch: `main`
- Public website: `https://guiping02-byte.github.io/ui-guidelines/`
- The GitHub Pages website becomes the only URL documented for viewers.

## Architecture

Keep the existing application source as the single UI implementation. Add a
small, GitHub-Pages-specific Vite entry that mounts the existing client page and
imports the existing global styles. This avoids duplicating the board while
allowing a static build that does not depend on the Sites worker runtime.

The existing Sites build configuration remains available only during migration
so the replacement can be validated before the destructive cleanup. It is not
used for future public releases.

## Components

### Static Pages entry

- A minimal HTML document supplies the root mounting element.
- A React entry module mounts the existing board component and imports its
  stylesheet.
- A separate Vite configuration sets the public base path to
  `/ui-guidelines/` and emits a Pages-ready static directory.
- Browser-only functionality such as local storage, clipboard access, color
  switching, and editable color values remains unchanged.

### Automated deployment

A GitHub Actions workflow runs on pushes to `main` and supports manual runs. It
installs the repository's existing package manager and Node.js version, builds
the static Pages artifact, uploads it, and deploys it with GitHub's official
Pages actions. The workflow receives only the minimum Pages and identity-token
permissions required for deployment.

### Documentation

The README identifies GitHub Pages as the public website and explains that:

- source changes pushed to `main` trigger a new deployment;
- deployment completes asynchronously after the push; and
- edits made inside the live board remain browser-local and do not commit
  themselves to GitHub.

## Data and State

The board has no server database. Its editable palette state remains in the
viewer's browser storage. A deployment replaces application assets but does not
attempt to migrate or synchronize that browser-local state with the repository.

## Failure Handling

- A failed build or test prevents deployment and leaves the last successful
  GitHub Pages version available.
- Incorrect repository base-path handling is caught by tests before release.
- The former Sites project is not deleted while the Pages deployment is
  missing, failed, or returning an error.
- If GitHub Pages cannot be enabled with the current repository permissions,
  the migration stops and reports the required GitHub setting without deleting
  the former project.

## Verification

Before deleting the former project:

1. Existing application tests and lint checks pass.
2. The static Pages build succeeds.
3. The generated HTML references assets under `/ui-guidelines/`.
4. The GitHub Actions Pages deployment reports success.
5. `https://guiping02-byte.github.io/ui-guidelines/` returns a successful HTTP
   response and displays the board.
6. The main board controls, theme switching, and browser-local persistence work
   on the new URL.

## Destructive Cutover

After every verification item passes, permanently delete Sites project
`appgprj_6a84204cfce8819182be3c25c15e8a4c`. The former URL
`https://blue-ui-board-lixujie.guiping02.chatgpt.site/` is not retained as a
backup or redirect. This deletion is intentionally irreversible and must be the
last migration action.

## Out of Scope

- Synchronizing live color edits back to GitHub.
- Adding authentication, a database, or collaborative editing.
- Redesigning the board or changing its design tokens during migration.
- Maintaining two public deployments after cutover.
