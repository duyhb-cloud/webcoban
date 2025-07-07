const express = require('express');

//const axios = require("axios");
//const crypto = require("crypto");
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());

app.use(express.static('public'));
app.set('view engine', 'ejs');

// Trang chính
app.get('/', (req, res) => {
  res.render('index'); // render views/index.ejs
});

app.listen(3000, () => {
  console.log(`Server is running at http://localhost:3000`);
});

/*
// Gửi về ESP32 (giả định IP 192.168.1.100)
const axios = require('axios');

axios.post('http://192.168.1.100:5000/delivery', {
  method,
  address,
  gps
});
*/
