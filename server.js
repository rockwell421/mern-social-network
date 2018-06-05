const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport"); //main authentication module

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//db config
const db = require("./config/keys").mongoURI;

//connect to mongodb
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected!"))
  .catch(err => console.log(err));

//Passport middleware
app.use(passport.initialize());

//Passport JWT Config Strategy
require("./config/passport.js")(passport);

//Use Routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
