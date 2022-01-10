const db = require('../db/db');
const router = require("express").Router();

router.get("/countries", (req, res) => {
    db.getCountries()
        .then(countries_data => {
            const countries = countries_data.reduce((acc, curr) => {
                if (!acc[curr.country]) {
                    acc[curr.country] = {}
                }
                if (!acc[curr.country][curr.year]) {
                  acc[curr.country][curr.year] = {}
                }
                if (!acc[curr.country]['id']) {
                  acc[curr.country]['id'] = curr.country_id
                }

                acc[curr.country][curr.year][curr.category] = {
                    "value": curr.value
                };
                return acc;
            }, {});
            res.status(200).json(countries);
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

router.get('/country/:id', (req, res) => {
    const id = req.params.id;
    const queries = req.query;

    queries.categories = queries.categories?.split(',');

    db.getCountry(id, queries)
      .then(country_data => {
        const country = country_data.reduce((acc, curr) => {
          if (!acc[curr.year]) {
            acc[curr.year] = {}
          }
          acc[curr.year][curr.category] = {
            "value": curr.value
          };
          return acc;
        }, {'name': country_data[0]?.country});
        res.status(200).json(country);
      })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

module.exports = router;
