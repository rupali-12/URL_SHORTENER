const express = require("express");
const app = express();
const shortId = require("shortid");
const mongoose = require("mongoose");
const createHttpError = require("http-errors");
const path = require("path");
const ShortUrl = require("./models/shortUrl");
const dotenv = require("dotenv");

dotenv.config();
mongoose.set("bufferCommands", false);

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", async (req, res, next) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  try {
    const { url } = req.body;

    if (!url) {
      throw createHttpError.BadRequest("Provide a valid URL");
    }

    // Check if already exists
    const urlExists = await ShortUrl.findOne({ url });

    if (urlExists) {
      return res.render("index", {
        short_url: `${baseUrl}/${urlExists.shortId}`, 
      });
    }

    // Create new short URL
    const shortUrl = new ShortUrl({
      url,
      shortId: shortId.generate(),
    });

    const result = await shortUrl.save();

    res.render("index", {
      short_url: `${baseUrl}/${result.shortId}`,
    });

  } catch (err) {
    next(err);
  }
});

// Redirect route
app.get("/:shortId", async (req, res, next) => {
  try {
    const { shortId } = req.params;

    const result = await ShortUrl.findOne({ shortId });

    if (!result) {
      throw createHttpError.NotFound("Short URL does not exist");
    }

    res.redirect(result.url);

  } catch (err) {
    next(err);
  }
});

// 404
app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render("index", { error: err.message });
});

// Start server ONLY after DB connects
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database Connected Successfully");

    app.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection error:", err);
  });