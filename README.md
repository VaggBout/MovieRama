# Workable - MovieRama

A social sharing platform where users can share their favorite movies.

# Features

-   User management (Login/Logout/Register) through JWT tokens
-   Add new movies (for logged-in users)
-   Vote movies (for logged-in users)
-   Homepage - View movies list with pagination
-   Profile page - View movies a user submitted with pagination

# Deployment

You can deploy the service either directly on your host machine or using Docker.

## a. Run on Host

### Clone project

```bash
git clone https://github.com/VaggBout/MovieRama.git
```

### Database setup

Before proceeding you will need an accessible running instance of Postgres with an empty database and a user who has access to it.  
If you don't have one you can spawn using [Docker](https://docs.docker.com/engine/install/) and the existing `docker-compose.yml` in the project. From the root folder of the project run:

```bash
docker-compose -f docker/docker-compose.yml up -d db
```

This will spawn a Postgres container with an empty database `movierama`, and a user `movie` with password `password`.

### Install dependencies

In order to run the project you will need `NodeJs` and `NPM` installed. It is suggested to use NodeJs 16.x or any newer LTS version. For installation instructions check [here](https://nodejs.org/en)

After having NodeJs and NPM installed you should install all the necessary dependencies. From the root folder run:

```bash
npm install
```

### Create configuration file

In the root folder of the project exists a file `example.env`. While in the root folder run

```bash
cp example.env .env
```

After that, using your favorite text editor, fill the missing properties with the appropriate values. The following values assume you have deployed a database using `docker` (previous step).

```
PORT=3000

NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=movierama
DB_USER=movie
DB_PASSWORD=password

# Secret used to sign tokens
TOKEN_SECRET=secret
```

### Run application

In order to start the application run the following:

```bash
npm run build
npm run migrate
npm run start
```

The aforementioned scripts will compile the application, run the necessary DB migrations to create the schema and bootstrap the server.  
After the server starts visit http://localhost:3000/.

## b. Run on Docker

Before starting make sure you have installed `docker` and `docker-compose` in your system. For installation instructions check [here](https://docs.docker.com/engine/install/).

### Clone project

```bash
git clone https://github.com/VaggBout/MovieRama.git
```

### Create configuration file

In the root folder of the project exists a file `example.env`. While in the root folder run

```bash
cp example.env .env
```

After that, using your favorite text editor, fill the missing properties with the following values:

```
PORT=3000

NODE_ENV=production

# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=movierama
DB_USER=movie
DB_PASSWORD=password

# Secret used to sign tokens
TOKEN_SECRET=secret
```

### Run application

In order to start the application run

```bash
docker-compose -f docker/docker-compose.yml up db movie_rama
```

This command will spawn two containers, one database (Postgres) and one instance of the application MovieRama.  
The application will connect to the db, based on the aforementioned configuration, and will automatically run the necessary DB migrations to create the schema.  
After the containers finish building visit http://localhost:3000/.

# Run tests

In order to run tests you will need a NodeJs 16.x installation in you system. Other LTS version will probably work but have not been tested. For installation instructions check [here](https://nodejs.org/en).

## Unit tests

### Install dependencies

Run:

```bash
npm run install
```

### Configuration file

Create a `.env` configuration file at the root of the project with the following values:

```bash
PORT=3000

NODE_ENV=test

# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=movierama
DB_USER=movie
DB_PASSWORD=password

# Secret used to sign tokens
TOKEN_SECRET=secret
```

NOTE: When running unit tests the configuration file will not be used in any way (e.g. create a db connection) but it is automatically validated from the application and thus is required.

### Run tests

```bash
npm run test
```

## Integration tests

In order to run integration tests you will also need the following:

-   A running and accessible instance of Postgres
-   A Postgres user with privileges to create/drop databases
-   A default database where user has access

If you don't have one, refer to [Database setup](#database-setup) to deploy one using Docker.

### Install dependencies

Run:

```bash
npm run install
```

### Configuration file

In order to run integration tests you will have to create a second configuration file, `.env.integration`. Assuming you have deployed a Postgres using [Database setup](#database-setup) the configuration file will look like this:

```bash
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres # Default database
DB_USER=postgres # User with access to create/drop DBs
DB_PASSWORD=securepwd # User's password

# Secret used to sign tokens
TOKEN_SECRET=test
```

### Run tests

```bash
npm run test:integration
```

NOTE: When running integration tests, each suite will create a new database with name `movieRama_test_${suiteName}`, create DB schema through migrations, run it's tests and drop the database.

# CI/CD

Github Actions are used to run CI/CD for this repository. Currently 3 tasks are defined, that are executed when pushing on `master` or when opening a pull request on `master`:

-   `lint`: Lint code
-   `unit-test`: Runs unit tests
-   `integration-test`: Runs integration tests
