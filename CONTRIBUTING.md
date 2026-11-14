# Team workflow (Git, GitHub and Agile)

## Branches
- `main` is always working and deployable. Nobody commits to it directly.
- Each Trello card gets its own branch: `feature/RIT-7-incident-crud`, `fix/RIT-21-login-error`.

## Steps for every task
1. Move the card to **In Progress** on Trello.
2. `git checkout main && git pull`, then `git checkout -b feature/RIT-<id>-<short-name>`
3. Commit small, clear changes: `git commit -m "RIT-7: add incident update route"`
4. `npm test` must pass, then `git push -u origin <branch>`.
5. Open a **pull request** to `main`. The template's checklist is the code review.
   GitHub Actions runs the tests automatically; a red ❌ must be fixed before merging.
6. A reviewer (a teammate, or a self-review against the checklist for a one-person team) approves, then **Squash and merge**.
7. Move the card to **Done**.

## Sprints
One-week sprints. Each sprint starts by moving cards from **Product Backlog** to **Sprint Backlog** and ends with a short weekly report (done, next, blockers).
