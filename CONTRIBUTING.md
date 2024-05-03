# How to contribute to this project

To keep things consistent, you should follow our coding style and our Git strategy.

## Coding style

On top of using Prettier, we adhere to the following conventions:

- Use `let` and `const` instead of `var`
- Use `kebab-case` for `file-names`, HTML `class-names` and `id-names`, `css-animations`, and `--css-variables`
- Use `camelCase` for JavaScript `variableNames`, and upper case for `ClassNames`
- Use `for` loops instead of `forEach`
- Use `querySelector` and `querySelectorAll` for everything

## Git strategy

We use a form of trunk-driven development. To add a new feature, follow these steps:

1. Make a GitHub issue describing your feature (using our template) and assign yourself
2. Make a new branch off of `dev`, and make your feature!
3. When you're done, make a pull request back into `dev` that closes your issue
4. If everything looks good, we will merge your feature into `dev`

The last branch we have is `main`, which is for production-ready code only and is updated around once a week.

Make sure to leave descriptive commit messages so we can keep a changelog.
