const sqlite3 = require('sqlite3').verbose();

// pass absolute path to db file
const DB_PATH = process.env.DB_PATH || './db/db.sqlite';

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    }
    console.log("Connected to database");
});

// Custom methods

// Get all countries
// Returns an array of objects
db.getCountries = function () {
    return new Promise((resolve, reject) => {
        db.all(`SELECT i.id, cnt.country, cnt.id as country_id, i.year, i.value, c.category FROM inventory i, countries cnt, category c where i.category_id=c.id AND cnt.id=i.country_id`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Get country by id
// Returns an array of objects
db.getCountry = function (id) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT i.id, cnt.country,  cnt.id as country_id, i.year, i.value, c.category FROM inventory i, countries cnt, category c where i.category_id=c.id AND cnt.id=i.country_id AND cnt.id=?`, id, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

module.exports = db;
