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

      await db.execute(`
        INSERT INTO Dogs (owner_id, name, size) VALUES
        ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
        ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
        ((SELECT user_id FROM Users WHERE username = 'lebronjames'), 'Sam', 'large'),
        ((SELECT user_id FROM Users WHERE username = 'jasper'), 'Spot', 'medium'),
        ((SELECT user_id FROM Users WHERE username = 'jasper'), 'Reggie', 'large')
        `);

      await db.execute(`
        INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
        ((SELECT dog_id FROM Dogs WHERE name = 'Max' AND owner_id = (select user_id FROM Users WHERE username = 'alice123')), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
        ((SELECT dog_id FROM Dogs WHERE name = 'Bella' AND owner_id = (select user_id FROM Users WHERE username = 'carol123')), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
        ((SELECT dog_id FROM Dogs WHERE name = 'Spot' AND owner_id = (select user_id FROM Users WHERE username = 'jasper')), '2025-07-10 10:30:00', 15, 'Glenelg', 'open'),
        ((SELECT dog_id FROM Dogs WHERE name = 'Reggie' AND owner_id = (select user_id FROM Users WHERE username = 'jasper')), '2025-08-10 11:30:00', 55, 'Elizabeth', 'accepted'),
        ((SELECT dog_id FROM Dogs WHERE name = 'Reggie' AND owner_id = (select user_id FROM Users WHERE username = 'jasper')), '2025-09-10 12:30:00', 60, 'Glenunga', 'open')
        `);
    } catch (err) {
        console.error('Error with inserting data:', err);
    }
}

app.get('api/dogs', async function(req,res) {
    try {
      const[dogs] = await db.execute(`
        SELECT dog.name AS dog_name, dog.size, u.username AS owner_username
        FROM Dogs Dog
        JOIN Users owner ON dog.owner_id`)
    }
}