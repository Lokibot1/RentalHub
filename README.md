# RentalHub

RentalHub is a platform that allows users to rent and lend items. This project is built using Node.js, Express, and MySQL.

## Prerequisites

Before you begin, ensure you have met the following requirements:
- You have installed Node.js and npm.
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

4. Create a [.env](http://_vscodecontentref_/3) file by copying [.env.example](http://_vscodecontentref_/4) and update the details:

    ```sh
    cp .env.example .env
    ```

    Then, open the [.env](http://_vscodecontentref_/5) file and add your database configuration:

    ```env
    # Application
    PORT=8000

    # Database
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=yourpassword
    DB_NAME=rentalhub 

    # JWT Auth
    JWT_SECRET=your_secret_key
    ```

    To generate a `JWT_SECRET` key, run the  commandfollowing:
    ```sh
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```

    You can then copy-paste the generated secret key into your .env file:
    ```env
    JWT_SECRET=<randomly-generated-secret-key>
    ```

5. Create the database in your MySQL client:

    ```sql
    CREATE DATABASE IF NOT EXISTS rentalhub;
    ```

6. And run this in the sql query editor

    ```sql
    USE rentalhub;

    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
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
Before starting new work, ensure your local repository is up-to-date with the latest changes from the develop branch. Follow these steps:  

1. Pull the latest updates from the develop branch:  
```sh
git checkout develop
git pull origin develop
```

2. Create a new branch for your work:  
```sh
git checkout -b your-feature-branch
```

Replace your-feature-branch with a descriptive name for your new branch. This ensures you are always working with the latest updates.

## Project Structure

- [server.js](http://_vscodecontentref_/1): The main entry point of the application.
- [package.json](http://_vscodecontentref_/2): Contains third party libraries.
- [.env](http://_vscodecontentref_/3): Contains environment configs.
- [configs/](http://_vscodecontentref_/4): Contains db configuration and schemas.
- [helpers/](http://_vscodecontentref_/5): Contains helper functions for the backend/frontend.
- [middlewares/](http://_vscodecontentref_/6): Contains functions that processes requests and responses before passing control to the next function.
- [public/](http://_vscodecontentref_/7): Contains static files such as CSS, JavaScript, and images.
- [routes/](http://_vscodecontentref_/8): Contains route definitions for the application.
- [views/](http://_vscodecontentref_/9): Contains HTML files (EJS Templating) for the frontend.