# Playwright Repo

This project is configured to run tests using Playwright. Follow the instructions below to clone the repository, navigate into the project directory, install dependencies, and run tests.

## Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher) 

## Getting Started

### 1. Clone the Repository

First, clone the repository to your local machine using the following command:

```sh
git clone https://github.com/risepoint/playwright.git
```
### 2. Change Directory

Navigate into the project directory:

```sh
cd playwright
```
### 3. Install Dependencies

Install the project dependencies using npm:

```sh
npm install
```

### 3. Run Playwright Tests

You can run all tests using the following command:

```sh
npm run test
```

To run specific tests, use the provided scripts in the package.json file. For example:
- To run the example test:
```sh
npm run test:example
```
- To run the sitemap test:
```sh
npm run test:sitemap
```

### Additional Information
- The tests are located in the tests directory.
- The configuration for Playwright can be found in the Playwright configuration file (playwright.config.ts or similar).

## Pipeline Overview

### Stages

#### 1. Get URLs from Pantheon

If `USE_URLS` is not selected, this stage triggers a job to get the URLs from Pantheon based on the provided `SITE_TAG`, `SITE_NAME`, and `ENV_NAME` parameters. The retrieved URLs are stored in the `TEST_URLS` environment variable.

#### 2. Run Playwright tests from tests directory within this repo.

This stage assumes the specified AWS role, sets up Git configuration, installs necessary npm packages, and runs the Playwright tests on the URLs specified in TEST_URLS.

It uses the URLs from Step 1 and passes them directly into the tests. 

## Updating Guide

TO BE FILLED IN LATER