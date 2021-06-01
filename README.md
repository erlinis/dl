# Dependencies List

Application to extract current version of specific dependencies in a projecs hosted in Github and constract it with the current stables versions to determinated if it requires to be updated.

## Supported Dependencies

- **Frameworks**

  - Rails
  - Sinatra

- **Languages**
  - Ruby

## How to run it

### Prerequisits

- Github App, it s needed to connect to Github and obtained the data of the reposotories to be analyzed.

  1. Create a new Github app [here](https://github.com/settings/apps) and grab the details.
  1. Click on the `Install App` option and install the application in your profile or organization.

### Installation

- Clone the repo

  ```sh
    git clone git@github.com:erlinis/dl.git
  ```

- Create a `.env` file and fill up the values.

  ```sh
    cd dl
    cp .env.sample .env
  ```

  **Important:**

  - `REPOSITORIES` list of repositories names comma separated and without spaces.
  - `GITHUB_APP_INSTALLATION_OWNER` your github user u organization name, depending where the app was installed.
  - `GITHUB_APP_PRIVATE_KEY` should be a string encoded in _base64_.
  - `GITHUB_APP_INSTALLATION_ID` can be found in your Github App in the `Install App` menu. Click the installation previouly done and take the "id" from the url: <https://github.com/apps/>**YOUR-APP**/installations/**INSTALLATION-ID**

- Install the dependencies

```sh
 yarn install
```

- Run the app

```sh
  yarn dev       # Local or development mode
  yarn start     # When in production
```

### Stack

- Node
- Fastify
- Handlebars
