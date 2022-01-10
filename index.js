const express = require("express");
if (process.env.DEV == true) {
  require("dotenv").config();
}
const routes = require("./routes/routes");
const app = express();

const HTTP_PORT = process.env.PORT || 8000
app.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log("Server is listening on port " + HTTP_PORT);
});

app.use(express.json());

app.use('/', routes);
