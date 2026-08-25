# Public GitHub Publishing Design

## Goal

Publish the UI design-system board source in a public GitHub repository owned by
`guiping02-byte`, and make the existing hosted board accessible without sign-in.

## Repository

- Public repository: `guiping02-byte/ui-guidelines`
- Display title and description may use the Chinese name “UI规范”.
- Default branch: `main`
- Source: the tracked files in the current UI board worktree.

## Website

- Keep the existing URL:
  `https://blue-ui-board-lixujie.guiping02.chatgpt.site/`
- Change only its access policy from private to public.
- Do not redesign or otherwise change the rendered board.

## Documentation

Replace the starter README with project-specific documentation containing the
public website link, local development commands, verification commands, and the
main design-token coverage.

## Verification

- The local working tree builds, tests, and lints successfully.
- The GitHub repository is public and contains the tracked source on `main`.
- The hosted website reports public access and opens at its existing URL.

