# How to contribute to this project
To keep things consistent, you should follow our coding style and our Git strategy.

## Coding style
On top of the guidelines set by ESLint and Prettier, we adhere to the following conventions:
- Use `let` and `const` instead of `var`; if a variable will not be reassigned, use `const` over `let`
- Use `kebab-case` for `file-names`, HTML `class-names` and `id-names`, `css-animations`, and `--css-variables`
- Use `camelCase` for JavaScript `variableNames`, and upper case for `ClassNames`
- Use `forEach`, `map` and other functional loops over their classical counterparts (i.e., `for` loops)
- Use `querySelector` and `querySelectorAll` over `getElementById` or `getElementsByClassName`

## Tests and linting
You can run the testing suite and linter locally with the following commands.
- `npm run test` to run the test suite
- `npm run lint` to run the linter and report any errors/warnings
- `npm run lint:fix` to run the linter and fix any automatically-fixable errors/warnings

## Git strategy
We use a form of trunk-driven development. To add a new feature, follow these steps:
1. Make a new branch off of `main`, and add your feature
2. Make a pull request back into `main` that closes your issue
3. Wait for all tests and linting to be performed; visit your preview link from Netlify. **Make sure all steps are passing and the preview looks correct before continuing**.
4. Request and receive code review from another developer
5. Merge into `main`

Make sure to leave descriptive commit messages so we can keep a changelog.

A detailed breakdown of the CI processes we have implemented can be found at [/design/architecture/ci/PIPELINE.md](/design/architecture/ci/PIPELINE.md).