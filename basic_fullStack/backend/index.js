const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const app = express();
const port = process.env.PORT | 5000;

dotenv.config();
app.use(cors());

app.get("/", (req, res) => {
  res.send("<h2>Hello World!</h2>");
});

app.get("/api/products", (req, res) => {
  const PRODUCTS = [
    {
      id: 1,
      title: "First Product",
      description: "This is first product",
    },
    {
      id: 2,
      title: "Second Product",
      description: "This is second product",
    },
    {
      id: 3,
      title: "Third Product",
      description: "This is third product",
    },
  ];

  res.send(PRODUCTS);
});

app.listen(port, () => {
  console.log(`This app is listening on the ${port}.`);
});
