const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const { listingSchema,reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "🚫 User must be logged in to create new Listing");
        return res.redirect("/login");
    } else {
        next();
    }
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing.owner._id.equals(res.locals.currentUser._id)) {
        req.flash("error", "🚫 Access Denied: You can only access trips you've created.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validatelisting = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validatereview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
};
  
module.exports.isauthor = async (req, res, next) => {
    let { id,reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review.author._id.equals(res.locals.currentUser._id)) {
        req.flash("error", "🚫 Access Denied: You don't have access to this trip rating.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};