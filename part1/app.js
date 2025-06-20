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

      await connection.query('CREATE DATABASE IF NOT EXISTS testdb');
      await connection.end();

      db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'DogWalkService'
      });

      const schemaSQL = fs.readFileSync(path.join(__dirname, 'part1', 'dogwalks.sql'), 'utf8');
      await db.query(schemaSQL);

      await insertSampleData();