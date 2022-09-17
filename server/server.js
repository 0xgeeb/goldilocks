const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const axios = require('axios');
const cors = require('cors');
require("dotenv").config();

const app = express();
let port = process.env.PORT || 3000;
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

console.log("NODE_ENV is", process.env.NODE_ENV);
 
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../build")));
  app.get("*", (request, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
  });
} else {
  port = 3001;
};

server.listen(port, () => console.log(`Listening on port ${port}`));