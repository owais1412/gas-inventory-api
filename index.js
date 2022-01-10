const express = require("express");
const cache = require("memory-cache");

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

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.contentType('application/json');
  next();
});

// set up using cache middleware for 10 minutes
const memCache = new cache.Cache();
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        let key =  '__express__' + req.originalUrl || req.url;
        let cacheContent = memCache.get(key);
        if(cacheContent){
            console.log("Cache hit for " + key);
            res.send(cacheContent);
            return;
        }else{
            res.sendResponse = res.send;
            res.send = (body) => {
                memCache.put(key, body, duration * 1000);
                res.sendResponse(body);
            }
            next();
        }
    }
}

app.use(cacheMiddleware(60));

app.use('/', routes);
