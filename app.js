const express = require("express");
const app = express();
const shortId = require("shortid");
const mongoose = require("mongoose");
const createHttpError = require("http-errors");
const ejs = require("ejs");
const path = require("path");
const ShortUrl = require("./models/shortUrl");
const dotenv = require("dotenv");

dotenv.config();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

// Db Connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected Successfully.."))
  .catch((err) => console.log("Error in Connecting Database  " + err));

//  Routes
app.get("/", async (req, res, next) => {
  res.render("index");
});
app.post("/", async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      throw createHttpError.BadRequest("Provide a valid url");
    }

    // {url: url}
    const urlExists = await ShortUrl.findOne({ url });
    if (urlExists) {
      res.render("index", {
        short_url: `http://localhost:${process.env.PORT}/${urlExists.shortId}`,
        // short_url: `https://url-shortener-1kt8.onrender.com:${process.env.PORT}/${urlExists.shortId}`,
      });
      return;
    }

    // if url not exist
    const shortUrl = new ShortUrl({ url: url, shortId: shortId.generate() });
    const result = await shortUrl.save();
    res.render("index", {
      short_url: `http://localhost:${process.env.PORT}/${result.shortId}`,
      // short_url: `https://url-shortener-1kt8.onrender.com:${process.env.PORT}/${result.shortId}`,
    });
  } catch (err) {
    next(err);
  }
});

// Handle short url navigation
app.get("/:shortId", async (req, res, next) => {
  try {
    const { shortId } = req.params;
    const result = await ShortUrl.findOne({ shortId: shortId });
    if (!result) {
      throw createHttpError.NotFound("Short Url does not Exist");
    }
    res.redirect(result.url);
  } catch (err) {
    next(err);
  }
});

// Error
app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

// Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render("index", { error: err.message });
});

// listen server
app.listen(process.env.PORT, () => {
  console.log(`Server Started on PORT ${process.env.PORT}`);
});
