var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Movie = new Schema({
  movieCode: String,
  movieId: String,
  movieTitle: String,
  movieImage: String,
  movieImageCloudinary: String,
  movieTrailerFile: String,
  movieSinopsis: String,
  cityCode: String,
  movieImax: String,
  key: String,
  poster: String
});

mongoose.model("Movie", Movie);
