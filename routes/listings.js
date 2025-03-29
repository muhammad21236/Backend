const express = require("express");
const router = express.Router();
const Joi = require("joi");
const multer = require("multer");

const store = require("../store/listings");
const categoriesStore = require("../store/categories");
const validateWith = require("../middleware/validation");
const auth = require("../middleware/auth");
const imageResize = require("../middleware/imageResize");
const delay = require("../middleware/delay");
const listingMapper = require("../mappers/listings");
const config = require("config");

// ✅ Set upload destination to "uploads/"
const upload = multer({
    dest: "uploads/",
    limits: { fieldSize: 25 * 1024 * 1024 },
});

// ✅ Updated Schema: Added `images` field
const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(""),
    price: Joi.number().required().min(1),
    categoryId: Joi.number().required().min(1),
    location: Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
    }).optional(),
    images: Joi.array().items(Joi.string()).optional(), // ✅ Added images field
});

// ✅ Validate categoryId before proceeding
const validateCategoryId = (req, res, next) => {
    if (!categoriesStore.getCategory(parseInt(req.body.categoryId)))
        return res.status(400).send({ error: "Invalid categoryId." });

    next();
};

// ✅ GET request to fetch all listings
router.get("/", (req, res) => {
    const listings = store.getListings();
    const resources = listings.map(listingMapper);
    res.send(resources);
});

// ✅ POST request to create a new listing
router.post(
    "/",
    [
        upload.array("images", config.get("maxImageCount")),
        validateWith(schema),
        validateCategoryId,
        imageResize,
    ],
    async (req, res) => {
        const listing = {
            title: req.body.title,
            price: parseFloat(req.body.price),
            categoryId: parseInt(req.body.categoryId),
            description: req.body.description,
            images: req.files.map((file) => ({ fileName: file.filename })), // ✅ Fixed image handling
        };

        // ✅ Properly handle location parsing
        if (req.body.location) {
            try {
                listing.location = JSON.parse(req.body.location);
            } catch (error) {
                return res.status(400).send({ error: "Invalid location format." });
            }
        }

        if (req.user) listing.userId = req.user.userId;

        store.addListing(listing);
        res.status(201).send(listing);
    }
);

module.exports = router;
