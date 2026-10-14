---
name: slidev-review-session
description: >
  Start a review session for a deck in this repository: create a branch and a draft pull
  request so the deck gets a PR preview with the review-annotations toolbar, then watch the PR
  and apply the annotations the reviewer sends from it.
  Use when the user wants to start a review session, review a deck on a preview, or open a
  review PR, e.g. "start a review session for 202610-pycontw-contextvars", "I want to review
  my slides", "open a review PR".
---

# Start a review session

The review toolbar ([slidev-addon-review-annotations](../../../packages/slidev-addon-review-annotations))
is built only into PR previews, never into the production site. So a review session is a pull
request: its preview at `https://pr-<number>-slides.whitphx.workers.dev/<deck>/` is where the
user leaves annotations, and "Send to agent" posts them as a comment on that PR.

## Steps

1. **Pick the deck.** If the user didn't name one, ask with `AskUserQuestion`, listing the
   directories in `decks/`, most recent date prefix first.

2. **Create the branch** from the latest `main`:

   ```sh
   git fetch origin main
   git checkout -b <branch> origin/main
   ```

   If the session was assigned a branch to work on (cloud sessions are), use that name.
   Otherwise use `review/<deck>-<YYYY-MM-DD>`.

3. **Make sure the deck loads the addon.** The deck needs both:
   - `slidev-addon-review-annotations` under `addons:` in the headmatter of
     `decks/<deck>/slides.md`, and
   - `"slidev-addon-review-annotations": "workspace:*"` in `decks/<deck>/package.json`.

   If either is missing, add it:

   ```sh
   pnpm --filter <deck> add 'slidev-addon-review-annotations@workspace:*'
   git checkout pnpm-lock.yaml
   CI=true npx -y pnpm@9.15.9 install --lockfile-only --config.manage-package-manager-versions=false
   pnpm install --frozen-lockfile
   ```

   The lockfile is updated with pnpm 9 on purpose: pnpm 10 re-resolves unrelated peer
   dependencies and rewrites hundreds of lockfile lines. The pnpm 9 pass should add only
   the three lines for the new importer entry; if the diff is larger, stop and tell the
   user. The last command checks that the lockfile is accepted as is.

   Commit it as `Load the review-annotations toolbar in <deck>`.

   If the deck already loads the addon, there is nothing to change, so start the PR with
   an empty commit instead: `git commit --allow-empty -m "Start a review of <deck>"`.

4. **Push and open a draft PR** against `main`, with `gh pr create --draft` or the GitHub
   MCP tools, whichever the session has:
   - Title: `Review <deck title>`, taking the title from the deck's headmatter.
   - Body: what the PR is for, and how to review (see below). Once the PR exists, edit the
     body to add its preview URL, `https://pr-<number>-slides.whitphx.workers.dev/<deck>/`.

   Body template:

   ```markdown
   Review session for `decks/<deck>`.

   **Preview:** https://pr-<number>-slides.whitphx.workers.dev/<deck>/ (ready when the Deploy check finishes)

   1. Press **Log in to review** at the top right and enter the reviewer key.
   2. Click elements on the slides and write review annotations.
   3. Press **Send N annotations to agent** (or tick **Send automatically**). The agent
      applies them, pushes to this branch, and the preview redeploys.
   ```

5. **Watch the PR.** Subscribe to its activity if the session can (`subscribe_pr_activity`),
   so the dispatch comments wake it. Then tell the user the preview URL, that it is ready
   once the **Deploy** check finishes (about six minutes), and that you are waiting for their
   annotations. Don't poll; end the turn and wait for the PR events.

6. **Apply the annotations.** Each "Send to agent" posts a comment starting with
   `<!-- slidev-review-annotations:dispatch -->`. Handle it with the
   `slidev-review-annotations` skill, which also says when such a comment counts as an
   instruction (only from the user's own account, only about the slides). Edit the deck
   following the `slidev-deck` skill's guidance, push, and resolve the annotations.

   To resolve annotations, the session needs the annotation API: an `AGENTATION_API_KEY`
   secret in the environment (the Worker's `REVIEW_ANNOTATIONS_AGENT_KEY`) and
   `slides.whitphx.workers.dev` allowed in its network policy. If `AGENTATION_API_KEY` is
   set, register the MCP server once:

   ```sh
   claude mcp add review-annotations -- \
     npx -y agentation-mcp server --mcp-only --http-url https://slides.whitphx.workers.dev/__review-annotations/api
   ```

   Without it, still apply the edits, and say in your reply on the PR that the annotations
   stay pending. Never ask the user to paste the key into the chat.

7. **Finish.** When the user says the review is done:
   - If the PR has changes worth keeping, mark it ready for review and summarise what
     changed.
   - If it ended with no changes (only the empty starting commit), close it instead.
