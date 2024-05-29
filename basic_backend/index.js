const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT | 5000;
console.log(port);

app.get("/", (req, res) => {
  res.send("Hello Mateen");
});

app.listen(port, () => {
  console.log(`app listening on the ${port}`);
});
