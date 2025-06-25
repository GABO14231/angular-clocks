# expressServer

This is a simple expressServer used for connecting to a database for managing the accounts. This includes account creation, deletion and updating the account data. This is required for the frontend to work.

To run this server, just run the following command:

```
npm i && npm run start
```

This requires you to also have [PostgreSQL](https://www.postgresql.org/) installed on your device and for you to have a database called "angular_clocks", you can change the database connection parameters in the [config.json](./config.json) file as needed.

For your convenience, there's an included .sql file in the [database_backup](./database_backup/) folder so you can easily recreate the database.