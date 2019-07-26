var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Gold = new Schema({
  berat: String,
  jual: String,
  beli: String
});

mongoose.model("Gold", Gold);

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/chatbot",
  { useNewUrlParser: true },
  () => {
    console.log("connect Mongoose");
  }
);
