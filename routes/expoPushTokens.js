const express = require("express");
const router = express.Router();
const Joi = require("joi");  // Make sure Joi is imported

const usersStore = require("../store/users");
const auth = require("../middleware/auth");
const validateWith = require("../middleware/validation");

router.post(
  "/",
  [
    auth,
    validateWith(Joi.object({ token: Joi.string().required() }))  // Ensure Joi object is used for schema validation
  ],
  (req, res) => {
    const user = usersStore.getUserById(req.user.userId);
    if (!user) return res.status(400).send({ error: "Invalid user." });

    user.expoPushToken = req.body.token;
    console.log("User registered for notifications: ", user);
    res.status(201).send();
  }
);

module.exports = router;  // Make sure to export the router
