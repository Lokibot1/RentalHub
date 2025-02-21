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
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your-database-password
    DB_NAME=rentalhub
    JWT_SECRET=your-jwt-secret
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
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
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

## Project Structure

- [server.js](http://_vscodecontentref_/1): The main entry point of the application.
- [routes](http://_vscodecontentref_/2): Contains route definitions for the application.
- [utils](http://_vscodecontentref_/3): Contains utility functions, including database connection.
- [public](http://_vscodecontentref_/4): Contains static files such as CSS, JavaScript, and images.
- [views](http://_vscodecontentref_/5): Contains HTML files for the frontend.
