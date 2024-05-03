# CI/CD Pipeline Documentation

## Prettier Linter
We implemented a Prettier linter as a Github Action. This action is triggered by a push to any of our branches(main and dev) to prevent any code style differences between future merges. The outcome of the linter is binary: either pass all the test, or fail with error. If error is found, it tells you exactly what to do. It specifies which files are causing the issue using it error messages. "-" in front of lines mean that the particular lines have to be redacted. "+", similarly, is an addtion to make. This particular linter follows behavior of Prettier, a popular linting option, which is available on VS Code(our primary IDE) as an extension. In addition, our linter checks for all html, css, and javascript files for Prettier error. Therefore, in order to prevent error arising on push, one should follow these steps on local:
1. Open Command Palette (Command + Shift + P for Mac)
2. Type “Format Document”
3. “Configure” if it’s your first time
4. Use Prettier (default setting)
5. Resolve issues (highlighted with red markers on line numbers)

The specific behaviors of the linter can be found in `.github/workflows/linter.yml`

## ES Lint
WE implemented ES Lint to make sure that our javascript code is written properly. This action is triggered by a push to main and dev bracnhes. ES Lint creates a convenient way for us to check whether all variaibles are being used and all variables are defined. You can check out what error it has caused us before in [issue 48](https://github.com/CSE110-Team17/cse110-sp23-group17/issues/48). Once we implemented ES Lint, we were able to make sure that all variables are properly defined and used. The associated yml file is `linter.yml`.

### JSDocs
We implemented JSDocs to create a seperate deployed html where future developers or ourselves can look at to see what each of our javascript functions are. JSDocs is automated in a way that if we write comments to a function in a certain way, it will generate the function description for us. This action is implemented for pushes to main and dev. The associated yml file is `jsdoc.yml`.

### Testing
We implemented jest unit tests and puppeteer tests for game and result pages. This action is triggered by pushes to main and dev. This action makes sure that before we merge dev into main, the most recent commits to dev/code changes are functional as expected. We tests for URL, button usages, card select, and more. The associated yml file is `test.yml`.

## Deployment 
We implemented a continuous delivery through Github Action's Static HTML deploy. This action is trigged by a push to **main** branch only. Once some code has been pushed to main, the action will adhere to the following steps: 1) checkout 2) set up pages 3) upload artifact 4) deploy to github pages. This pipeline piece allows us developers to see result of our latest build with no effort. One can simply navigate to `https://cse110-team17.github.io/cse110-sp23-group17/` to view the latest updated web application.
