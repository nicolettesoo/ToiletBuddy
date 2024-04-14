const jwt = require('jsonwebtoken');
const queryRepository = require('../queryRepository');
const db = require('../models/appModels');

const reviewController = {};

reviewController.addReview = async (req, res, next) => {
    // console.log('I am in add review')
    const { rating, text } = req.body;
    const { userId } = res.locals;

    // can get username from cookie for post request to add a review

    if (!userId) return next({ log: 'Error: could not validate JWT', status: 403, message: { err: 'You are not authorized to perform this operation' } });

    const getEstablishmentParams = [req.params.id]
    const getEstablishmentResult = await db.query(queryRepository.getEstablishmentByGoogleId, getEstablishmentParams);
    let establishment = getEstablishmentResult.rows.length ? getEstablishmentResult.rows[0] : null;

    if (!establishment) {
      // placeholder data rn for everything except google maps id
      const createEstablishmentParams = [req.params.id, 2, 3, 4, 5, 6, 7, 8];
      const createEstablishmentResult = await db.query(queryRepository.createEstablishmentByGoogleId, createEstablishmentParams);
      const rows = createEstablishmentResult.rows;
      establishment = rows[0];
    }
    
    const establishmentId = establishment._id;

    const createReviewParams = [establishmentId, userId, rating, text];
    await db.query(queryRepository.createReviewByEstablishmentId, createReviewParams);

    return next();
}

reviewController.getReviews = async (req, res, next) => {
    const parameters = [req.params.id];

    try {
      const dbResult = await db.query(queryRepository.getReviewsByEstablishmentGoogleId, parameters);
      res.locals.reviews = dbResult.rows;
      // console.log(res.locals.reviews);
      return next();
    }
    catch {
      return next({ log: 'Error querying DB: getReviewsByEstablishmentGoogleId', message: { err: 'Could not retreive data. Check server logs for details' } });
    }
}

module.exports = reviewController;