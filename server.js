const express = require('express');
const path = require('path');

const app = express();
const port = 8076;
app.set('PORT', port);

app.listen(app.get('PORT'), (err) => {
  if (err) {
    console.log('Error starting server', err);
  } else {
    console.log(`server listening on port ${app.get('PORT')}`);
  }
});

app.get('/',(req,res) => {
  res.sendFile(path.join(__dirname,'index.html'));
});
app.get('/mandelbrot.js',(req,res) => {
  res.sendFile(path.join(__dirname,'mandelbrot.js'));
});