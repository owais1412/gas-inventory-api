const db = require('../db/db');
const router = require("express").Router();


/**
 * @swagger
 * /countries:
 *   get:
 *     summary: Returns the list of all countries with their respective inventories
 *     responses:
 *       200:
 *         description: The list of the countries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */

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


/**
 * @swagger
 * /country/{id}:
 *   get:
 *     summary: Get the country by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book id
 *       - in: query
 *         name: startYear
 *         schema:
 *            type: integer
 *         required: false
 *         description: The start year of the gas emission
 *         default: 1990
 *       - in: query
 *         name: endYear
 *         schema:
 *           type: integer
 *         required: false
 *         description: The end year of the gas emission
 *         default: 2014
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         required: false
 *         description: The category of the gas emission
 *         note: Pass categories as a comma separated string
 *         example:
 *           "CO2,CH4,N2O"
 *     responses:
 *       200:
 *         description: The countries data with the given id and params
 *         contens:
 *           application/json:
 *       404:
 *         description: The country is not found
 */

router.get('/country/:id', (req, res) => {
    const id = req.params.id;
    const queries = req.query;

    queries.categories = queries.categories?.split(',');

    db.getCountry(id, queries)
      .then(country_data => {
        if (country_data.length == 0) {
          res.status(404).json({ error: 'Incorrect countryid/year/category' });
          return;
        }

        const country = country_data.reduce((acc, curr) => {
          if (!acc[curr.year]) {
            acc[curr.year] = {}
          }
          acc[curr.year][curr.category] = {
            "value": curr.value
          };
          return acc;
        }, {'name': country_data[0].country});
        res.status(200).json(country);
      })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

module.exports = router;
