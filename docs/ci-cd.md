# CI/CD Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Performance and Weight-Balance project.

## Overview

The CI/CD pipeline automatically runs whenever code is pushed to the `main` or `develop` branches, or when pull requests are made to these branches. It helps ensure code quality and prevent regressions by automating testing, linting, and build processes.

## Pipeline Steps

The pipeline consists of the following steps:

1. **Checkout Code**: Downloads the repository code to the GitHub Actions runner.
2. **Setup Node.js**: Configures Node.js environment with version 20.
3. **Install Dependencies**: Installs all npm packages required by the project.
4. **Lint**: Runs static code analysis to identify problematic patterns.
5. **Run Tests**: Executes the test suite to verify functionality.
6. **Build**: Compiles the application to ensure it builds successfully.
7. **Upload Coverage**: Sends test coverage reports to Codecov for visibility.

## Workflow Configuration

The workflow is defined in `.github/workflows/ci.yml`. This configuration:

- Triggers on pushes and pull requests to `main` and `develop` branches
- Uses a Linux environment (Ubuntu) for all jobs
- Caches npm dependencies to speed up subsequent runs

## Local Development

Before pushing code, you can simulate the CI pipeline locally:

```bash
cd client
npm ci         # Clean install dependencies
npm run lint   # Run linting
npm test       # Run tests
npm run build  # Build the project
```

## Codecov Integration

Code coverage reports are automatically uploaded to Codecov after tests run. You can view coverage reports on the Codecov dashboard to identify areas of code that may need additional testing.

## Workflow Status

You can check the status of workflow runs in the "Actions" tab of the GitHub repository. Each workflow run will be marked as:

- ✅ **Success**: All steps completed successfully
- ❌ **Failure**: One or more steps failed
- ⚠️ **Warning**: Completed with non-blocking issues

## Troubleshooting

If the CI pipeline fails, check:

1. **Lint errors**: Review the lint step output for code style violations
2. **Failed tests**: Check the test step output for failing tests
3. **Build errors**: Look at the build step for compilation failures

## Future Improvements

Potential enhancements to the CI/CD pipeline:

- Automated deployment to staging environments
- Performance testing integration
- Security scanning
- E2E testing with Cypress or Playwright