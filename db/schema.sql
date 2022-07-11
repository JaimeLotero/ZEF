CREATE DATABASE zef;
USE zef;

CREATE TABLE user (
    user_id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(64),
    password VARCHAR(256),
    salt VARCHAR(32),
    role ENUM('admin', 'member'),
    PRIMARY KEY (user_id),
    UNIQUE(username)
);

CREATE TABLE member (
    member_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(64),
    email VARCHAR(64),
    zkn_balance FLOAT,
    user_id INT NOT NULL,
    PRIMARY KEY (member_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE project (
    project_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(32),
    currency VARCHAR(32),
    exchange_rate REAL NOT NULL,
    owner_id INT NOT NULL,
    supply REAL NOT NULL,
    cap REAL NOT NULL,
    PRIMARY KEY (project_id),
    FOREIGN KEY (owner_id) REFERENCES member(member_id) ON DELETE CASCADE,
    UNIQUE(name),
    UNIQUE(currency)
);

CREATE TABLE investment (
    member_id INT NOT NULL,
    project_id INT NOT NULL,
    amount REAL,
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE,
    CONSTRAINT PK_Investment PRIMARY KEY (member_id, project_id)
);

CREATE TABLE currency (
    currency_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(32),
    kuna_ratio FLOAT,
    PRIMARY KEY(currency_id),
    UNIQUE(name)
);
