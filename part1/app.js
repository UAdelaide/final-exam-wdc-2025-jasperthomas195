const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
var logger = require('morgan');
const fs = require('fs');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));

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

      const schemaSQL = fs.readFileSync(path.join(__dirname, 'dogwalks.sql'), 'utf8');
      await db.query(schemaSQL);

      await insertData();
      console.log('Database created successfully');
    } catch (err) {
        console.error('Error making database', err);
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

app.get('/api/dogs', async function(req,res) {
    try {
        const[dogs] = await db.execute(`
        SELECT dog.do_id, dog.name AS dog_name, dog.size, owner.username AS owner_username, dog.owner_id
        FROM Dogs Dog
        JOIN Users owner ON dog.owner_id = owner.user_id
        `);
        res.json(dogs);
    } catch (err) {
        res.status(500).json({ error: 'Error getting dog data' });
    }
});

app.get('/api/walkrequests/open', async function(req,res) {
    try {
        const[requests] = await db.execute(`
        SELECT
        walkRequests.request_id,
        dog.name AS dog_name,
        walkRequests.requested_time,
        walkRequests.duration_minutes,
        walkRequests.location,
        owner.username AS owner_username
        FROM WalkRequests walkRequests
        JOIN Dogs dog ON walkRequests.dog_id = dog.dog_id
        JOIN Users owner ON dog.owner_id = owner.user_id
        WHERE walkRequests.status = 'open'
        `);
        res.json(requests);
    } catch (err) {
        res.status(500).json({error: 'Error getting walk request data'});
    }
});

app.get('/api/walkers/summary/', async function(req, res) {
    try {
        const[summary] = await db.execute(`
        SELECT
        walker.username AS walker_username,
        COUNT(rating.rating_id) AS total_ratings,
        AVG(rating.rating) AS average_rating,
        COUNT(DISTINCT CASE
            WHEN app.status = 'accepted' AND req.status = 'completed'
            THEN req.request_id
            ELSE NULL
        END) AS completed_walks
        FROM Users walker
        LEFT JOIN WalkApplications app ON walker.user_id = app.walker_id
        LEFT JOIN WalkRequests req ON app.request_id = req.request_id
        LEFT JOIN WalkRatings rating ON walker.user_id = rating.walker_id
        WHERE walker.role = 'walker'
        GROUP BY walker.user_id
        `);
        res.json(summary);
    } catch (err) {
        res.status(500).json({error: 'Error getting walker summary data'});
    }
});

module.exports = app;