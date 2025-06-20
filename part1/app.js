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

      // Now connect to the created database
      db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'testdb'
      });