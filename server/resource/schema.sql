CREATE DATABASE IF NOT EXISTS rentalhub;

USE rentalhub;

-- Only for development
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS rental_transactions;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;


-- users
CREATE TABLE IF NOT EXISTS users
(
    id             INT AUTO_INCREMENT PRIMARY KEY,
    role_id        INT          NOT NULL DEFAULT 2,
    first_name     VARCHAR(50)  NOT NULL,
    middle_name    VARCHAR(20),
    last_name      VARCHAR(50)  NOT NULL,
    suffix         VARCHAR(10),
    contact_number VARCHAR(20)  NOT NULL,
    social_media   VARCHAR(100),
    region         VARCHAR(100),
    city           VARCHAR(100),
    barangay       VARCHAR(100),
    address        VARCHAR(150),
    postal_code    VARCHAR(6),
    profile_image  VARCHAR(50),
    email          VARCHAR(100) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,
    otp            INT(6),
    created_at     TIMESTAMP             DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users
    ADD COLUMN password_reset_token VARCHAR(255) NULL AFTER password;


-- Note: (Only for development)
-- Password is '1234567a'
INSERT INTO users (role_id, first_name, last_name, contact_number, email, password, social_media, address)
VALUES (1, 'Admin', 'Admin', '09123456789', 'admin@gmail.com',
        '$2a$10$Bru/3reMfMIXlu4uw9PQ..RDNyRPVZ49YeHlhveh4.PpsFTmBopjW', 'admin@rentalhub.com', 'Rental Hub Compound');

-- categories
CREATE TABLE IF NOT EXISTS categories
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    keyword    VARCHAR(50)  NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name, keyword)
VALUES ('Events & Parties', 'events-and-parties'),
       ('Tech & Gadgets', 'tech-and-gadgets'),
       ('Clothing & Accessories', 'clothing-and-accessories'),
       ('Sports & Outdoor Gear', 'sports-and-outdoor-gear'),
       ('Tools & Equipment', 'tools-and-equipment'),
       ('Musical Instruments', 'musical-instruments'),
       ('Home & Office', 'home-and-office'),
       ('Pets Accessories', 'pets-accessories');


-- roles
CREATE TABLE IF NOT EXISTS roles
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name)
VALUES ('admin'),
       ('user');


-- items
CREATE TABLE IF NOT EXISTS items
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)   NOT NULL,
    price       DECIMAL(10, 2) NOT NULL,
    description TEXT,
    location    VARCHAR(255)   NOT NULL,
    file_path   VARCHAR(100)   NOT NULL,
    user_id     INT            NOT NULL,
    category_id INT            NOT NULL,
    is_archived TINYINT(1)     NOT NULL DEFAULT 0,
    is_approved TINYINT(1)     NOT NULL DEFAULT 0,
    created_at  TIMESTAMP               DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP               DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

ALTER TABLE items
    ADD COLUMN is_declined TINYINT(1) NOT NULL DEFAULT 0 AFTER is_approved;

-- reviews
CREATE TABLE reviews
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    item_id     INT NOT NULL,
    user_id     INT NOT NULL,
    rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);


-- inventory
CREATE TABLE inventory
(
    id             INT PRIMARY KEY AUTO_INCREMENT,
    item_id        INT,
    stock_quantity INT       DEFAULT 0,
    last_updated   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items (id)
);


-- rental_transactions
CREATE TABLE rental_transactions
(
    id               INT AUTO_INCREMENT PRIMARY KEY,
    renter_id        INT                         NOT NULL,
    item_id          INT                         NOT NULL,
    start_date       DATE                        NOT NULL,
    end_date         DATE                        NOT NULL,
    total_price      DECIMAL(10, 2)              NOT NULL,
    rental_quantity  INT                         NOT NULL                         DEFAULT 1,
    mode_of_delivery ENUM ('meetup', 'delivery') NOT NULL                         DEFAULT 'meetup',
    status           ENUM ('pending', 'ongoing', 'cancelled', 'declined') DEFAULT 'pending',
    is_approved      TINYINT(1)                  NOT NULL                         DEFAULT 0,
    created_at       TIMESTAMP                                                    DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP                                                    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (renter_id) REFERENCES users (id),
    FOREIGN KEY (item_id) REFERENCES items (id)
);

ALTER TABLE rental_transactions
    MODIFY COLUMN status ENUM ('pending', 'ongoing', 'cancelled', 'declined', 'done') DEFAULT 'pending';
