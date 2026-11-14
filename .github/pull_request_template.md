## What does this pull request do?
<!-- One or two sentences, plus the Trello card ID (e.g. RIT-7) -->

## How was it tested?
- [ ] `npm test` passes locally
- [ ] Postman requests for the changed routes return the expected status codes

## Code review checklist
- [ ] Follows the MVC structure (route → controller → model)
- [ ] Protected routes use `requireSignin` and the right authorization check
- [ ] Input is validated; errors return a clear message and the correct status code
- [ ] No secrets, `.env` or `node_modules` committed
- [ ] Code is commented and readable
