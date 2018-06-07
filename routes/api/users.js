const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

//load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//Load user model
const User = require("../../models/User");

//@route    GET api/users/test
//@desc     Tests users route
//@access   Public
router.get("/test", (req, res) => res.json({ msg: "Users Works" }));

//@route    GET api/users/register
//@desc     Register user, check if they exist, return err if true, if not, creates a new user and hashes the password
//@access   Public

router.post("/register", (req, res) => {
  //pull out errors and isValid via destructuring
  const { errors, isValid } = validateRegisterInput(req.body); //includes everything sent to the route

  //Check Validation & returns errors
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size
        r: "pg",
        d: "mm"
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: avatar,
        password: req.body.password
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@route    GET api/users/login
//@desc     Login user, check if they exist, return JWT
//@access   Public

router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body); //includes
  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  //find user by email
  User.findOne({ email }).then(user => {
    //check for user
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }
    //check password
    bcrypt.compare(password, user.password).then(isMatch => {
      //User Matched
      if (isMatch) {
        //create JWT payload- you can add more if needed
        const payload = { id: user.id, name: user.name, avatar: user.avatar };

        //JWT signature
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (error, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "Password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

//@route    GET api/users/current
//@desc     return current user (whoever the token belongs to)
//@access   Private

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
