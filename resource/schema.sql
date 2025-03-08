CREATE DATABASE IF NOT EXISTS rentalhub;
USE rentalhub;

-- Only for development
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
    contact_number VARCHAR(20)  NOT NULL,
    social_media   VARCHAR(20),
    street         VARCHAR(50),
    barangay       VARCHAR(50),
    city           VARCHAR(50),
    zip_code       VARCHAR(5),
    image_file     VARCHAR(50),
    email          VARCHAR(100) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,
    otp            INT(6),
    created_at     TIMESTAMP             DEFAULT CURRENT_TIMESTAMP
);

-- Note: (Only for development)
-- Password is '1234567a'
INSERT INTO users (role_id, first_name, last_name, contact_number, email, password)
VALUES (1, 'Admin', 'Admin', '09123456789', 'admin@gmail.com',
        '$2a$10$Bru/3reMfMIXlu4uw9PQ..RDNyRPVZ49YeHlhveh4.PpsFTmBopjW');

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
    name        VARCHAR(100) NOT NULL,
    price       VARCHAR(100) NOT NULL,
    description TEXT,
    location    VARCHAR(255) NOT NULL,
    file_path   VARCHAR(100) NOT NULL,
    user_id     INT          NOT NULL,
    category_id INT          NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);
