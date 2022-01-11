const sqlite3 = require('sqlite3').verbose();

// pass absolute path to db file
const DB_PATH = process.env.DB_PATH || './db/db.sqlite';

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    }
    console.log("Connected to database");
});

// store get countries string in a const variable
// to avoid typos
const GET_COUNTRIES_SQL = `SELECT i.id, cnt.country, cnt.id as country_id, i.year,` +
  ` i.value, c.category FROM inventory i, countries cnt, category c where` +
  ` i.category_id=c.id AND cnt.id=i.country_id`;

// Custom methods

// Get all countries
// Returns an array of objects
db.getCountries = () => {
    return new Promise((resolve, reject) => {
        db.all(GET_COUNTRIES_SQL, (err, rows) => {
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
db.getCountry = (id, queries) => {
  return new Promise((resolve, reject) => {
    let query_string = GET_COUNTRIES_SQL + ` AND cnt.id=?`;

    if (queries.startYear) {
      query_string += ` AND i.year >= ${queries.startYear}`;
    }
    if (queries.endYear) {
      query_string += ` AND i.year <= ${queries.endYear}`;
    }
    if (queries.categories) {
      let category_string = '';
      queries.categories.forEach((category) => {
        category_string += `'${category}',`;
      });
      category_string = category_string.slice(0, -1);
      query_string += ` AND c.category IN (${category_string})`;
    }

    db.all(query_string, id, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

module.exports = db;
