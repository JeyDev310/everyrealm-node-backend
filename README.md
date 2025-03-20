
## Installation

- Node JS version Used is >=16.13.0 & < 16.16.2

## How to run application in Dev mode (locally)
- First copy .env.sample file to .env and fill the all env variables
- keep the same database name as admin-end
- Then run `npm i` to install all the dependencies
- After installing, please run `npm run start:dev`. It will start the server in watch mode
- No need to run migrations from player-end , we have to run it from admin-end

## How to run application in production mode
- First copy .env.sample file to .env and fill the all env variables
- Then run `npm i` to install all the dependencies
- Run `make build` to build the project
- After installing, please run `npm run start` to start the project

## Other NPM scripts and Make Commands
- `npm run lint` for linting of the application
- `npm run sequelize` for sequelize cli
- `npm run doc` for generating the doc of the application
- `make clean` for deleting the project build
- `make push` for push the changes to the git stream
- `make pull` for pull the latest changes from the git stream with rebase
