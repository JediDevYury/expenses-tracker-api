# Event Management System - API


Big thanks for the [basic API template with Drizzle](https://github.com/zacharynoble/express-typescript-postgres-drizzle-auth-template) to [Zach](https://github.com/zacharynoble).

# How to run this project




### Create a .env file at the app root level for configurations
    NODE_ENV = DEVELOPMENT

    DB_HOST = localhost
    DB_PORT = 5432
    DB_USER = yourusername
    DB_PASSWORD = yourpassword
    DB_DATABASE = yourdbname

    APP_PORT = 8080
    JWT_SECRET_KEY = make-sure-this-secret-key-is-very-secure-in-prod


### Install Packages
    npm install


### Start the application in dev mode
    npm run dev


### Start the application in production mode
    npm run build
    npm run start


### Generate SQL migration script
    npm run generate


### Browser SQL editor
    npm run studio

