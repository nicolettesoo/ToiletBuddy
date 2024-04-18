const jwt = require('jsonwebtoken');
const db = require('../models/appModels');
const queryRepository = require('../queryRepository');
const errorMessageConstants = require('../constants/errorMessageConstants');

const userController = {}

userController.loginUser = (userData, loginResponse) => {
  const username = userData.email.substring(0, userData.email.indexOf('@'))
  const values = [username]
  db.query(queryRepository.getUserId, values)
    .then (data => {
      if (data.rows.length === 0){
        db.query(queryRepository.insertUser, values).then(insertData => {
          const userId = insertData.rows[0]._id
          const token = jwt.sign({'userId': userId}, process.env.SECRET_KEY)
          loginResponse.cookie('authorization', token)
          loginResponse.redirect('/')
        });
      }
      else {
        const userId = data.rows[0]._id
        const token = jwt.sign({'userId': userId}, process.env.SECRET_KEY)
        loginResponse.cookie('authorization', token)
        loginResponse.redirect('/')
        //console.log('token', token)
      }
    });
}

userController.logoutUser = (userData, loginResponse, next) => {
  loginResponse.clearCookie('authorization');
  return next();    
}

userController.verifyUser = (req, res, next) => {
  try {
    jwt.verify(req.cookies.authorization, process.env.SECRET_KEY);
    return next();
  } 
  catch {
    return next({
      log: 'userController.verifyUser: User not logged in but is authorized to access page',
      status: 200,
      message: errorMessageConstants.USER_READONLY_ACCESS,
    });
  }
}

userController.checkPermissions = (req, res, next) => {
  try {
    const response = jwt.verify(req.cookies.authorization, process.env.SECRET_KEY)
    res.locals.userId = response.userId;
    return next();
  } 
  catch (err) {
    return next({
      log: `userController.checkPermissions: ${err}`,
      status: 403,
      message: errorMessageConstants.USER_NOT_AUTHORIZED,
    });
  }
}



module.exports = userController;
