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
        


