const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ShortUrlSchema = new Schema({
  url: {
    type: String,
    require: true,
  },
  shortId: {
    type: String,
    require: true,
  },
});
// collection name, schema that we created
const ShortUrl = mongoose.model("shorturl", ShortUrlSchema);
module.exports = ShortUrl;
