# A Kingdom app server for `KIN Blockchain Network` 

This is a DEMO app server for [`KIN Blckchain Network`][man].
We use this app to show the following item: 
- Use SDK to interact with KIN Blockchain
- Use KRE
- Integrity with Mobile APP

## Technologies

- GraphQL
- TypeScript
- [Prisma](https://www.prisma.io/]


## Getting started

```sh
# 1. Clone the project
`git clone git@github.com:abuiles/kingdom.git`

# 2. Navigate to the project
cd anchorx-api

# 3. Start server (runs on http://localhost:4000) and open GraphQL Playground
yarn dev
```

## Documentation

### Commands

* `yarn start` starts GraphQL server on `http://localhost:4000`
* `yarn dev` starts GraphQL server on `http://localhost:4000` _and_ opens GraphQL Playground
* `yarn playground` opens the GraphQL Playground for the `projects` from [`.graphqlconfig.yml`](./.graphqlconfig.yml)
* `yarn prisma <subcommand>` gives access to local version of Prisma CLI (e.g. `yarn prisma deploy`)

> **Note**: We recommend that you're using `yarn dev` during development as it will give you access to the GraphQL API or your server (defined by the [application schema](./src/schema.graphql)) as well as to the Prisma API directly (defined by the [Prisma database schema](./generated/prisma.graphql)). If you're starting the server with `yarn start`, you'll only be able to access the API of the application schema.

### Deploying

```
# 1. Run prisma deploy
yarn prisma deploy
```
