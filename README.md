# RentalHub

RentalHub is a platform that allows users to rent and lend items. This project is built using Node.js, Express, and
MySQL.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed Node.js (latest LTS version recommended).
- You have installed MySQL.
- You have a MySQL database set up.

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/almerleoalmazan/rentalhub.git
    ```

2. Navigate to the project directory:

    ```sh
    cd rentalhub
    ```

3. Install the dependencies:

    ```sh
    npm install
    ```

4. Create a [.env](http://_vscodecontentref_/3) file by copying [.env.example](http://_vscodecontentref_/4) and
   update the details:

    ```sh
    cp .env.example .env
    ```

   Then, open the [.env](http://_vscodecontentref_/5) file and add your database configuration:

    ```env
    # Application
    PORT=8000

    BASE_URL=http://localhost:8000

    # Database
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=yourpassword
    DB_NAME=rentalhub 

    # Upload Directory
    STORAGE_PATH=C:\uploads

    # JWT Auth
    JWT_SECRET=your_secret_key
    ```

   Then create a folder named `uploads` in the `C:\`.
   This is where the uploaded files will be stored.
    ```sh
      # Copy and paste this command in your command prompt
      mkdir C:\uploads
    ```

   To generate a `JWT_SECRET` key, run the command:
    ```sh
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```

   You can then copy-paste the generated secret key into your .env file:
   `Note: Angle brackets are not part of the secret key.`
    ```env
    JWT_SECRET=<randomly-generated-secret-key>
    ```

## Database Setup

1. Create the database in your MySQL client.

    ```sql
    CREATE DATABASE IF NOT EXISTS rentalhub;
    ```

2. Run the migration script to create the tables and insert sample data.
    NOTE: This will remove all images you uploaded in the items table.

    ```sh
    npm run db:migrate
    ```

## Running the Project

1. Start the MySQL server and ensure your database is running.

2. Run the project:

    ```sh
    npm run dev
    ```

3. Open your browser and navigate to:

    ```sh
    http://localhost:8000
    ```

## Updating and Creating a New Branch

Before starting new work, ensure your local repository is up-to-date with the latest changes from the develop branch.
Follow these steps:

1. Pull the latest updates from the develop branch:

```sh
git checkout develop
git pull origin develop
```

2. Create a new branch for your work:

```sh
git checkout -b your-new-branch
```

Replace your-new-branch with a descriptive name. This ensures you are always working with the latest updates.

## Project Structure

- [server.js](http://_vscodecontentref_/1): The main entry point of the application.
- [package.json](http://_vscodecontentref_/2): Contains third party libraries.
- [.env](http://_vscodecontentref_/3): Contains environment configs.
- [configs/](http://_vscodecontentref_/4): Contains db and mail configuration.
- [helpers/](http://_vscodecontentref_/5): Contains helper functions for the backend/frontend.
- [middlewares/](http://_vscodecontentref_/6): Contains functions that processes requests and responses before passing
  control to the next function.
- [public/](http://_vscodecontentref_/7): Contains static files such as CSS, JavaScript, and images.
- [resource/](http://_vscodecontentref_/4): Contains schema.sql file.
- [routes/](http://_vscodecontentref_/8): Contains route definitions for the application.
- [views/](http://_vscodecontentref_/9): Contains HTML files (EJS Templating) for the frontend.

## Dependencies

The project uses the following dependencies, which are listed in the `package.json` file:

- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [cookie-parser](https://github.com/expressjs/cookie-parser)
- [express](https://github.com/expressjs/express)
- [ejs](https://github.com/mde/ejs)
- [express-ejs-layouts](https://github.com/Soarez/express-ejs-layouts)
- [joi](https://github.com/hapijs/joi)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [mysql2](https://github.com/sidorares/node-mysql2)
- [morgan](https://github.com/expressjs/morgan)
- [multer](https://github.com/expressjs/multer)
- [nodemailer](https://github.com/nodemailer/nodemailer)
