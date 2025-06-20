const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const fs = require('fs');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let db;

(async () => {
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: ''
      });

      await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
      await connection.end();

      db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'DogWalkService',
        multipleStatements: true
      });

      const schemaSQL = fs.readFileSync(path.join(__dirname, 'part1', 'dogwalks.sql'), 'utf8');
      await db.query(schemaSQL);

      await insertData();
      console.log('Database created successfully');
    } catch (err) {
        console.error('Error creating database', err);
    }
})();

async function insertData() {
    try {
      await db.execute(`
        INSERT INTO Users (username, email, password_hash, role) VALUES
        ('alice123', 'alice@example.com', 'hashed123', 'owner'),
        ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
        ('carol123', 'carol@example.com', 'hashed789', 'owner'),
        ('lebronjames', 'lebron@example.com', 'hashed321', 'walker'),
        ('jasper', 'jasper@example.com', 'hashed987', 'owner')
      `);