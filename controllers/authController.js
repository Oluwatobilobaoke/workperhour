const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/libs/catchAsync');
const AppError = require('../utils/libs/appError');
const sendEmail = require('../utils/libs/email');
const {
  signAccessToken,
  verifyAccessToken,
} = require('../utils/libs/jwt-helper');

const createSendToken = (user, statusCode, res) => {
  const token = signAccessToken({ id: user._id });

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.CBA_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Logout User
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

// Login User
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // Check if the user exists and password correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  // If all true, send token to user
  createSendToken(user, 200, res);
});

exports.adminCreateAdmin = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (user) {
    return next(new AppError('Email already taken', 400));
  }

  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });


  const options = {
    email: req.body.email,
    subject: 'Signup Successful!',
    message: "Welcome to COG, we're glad to have you 🎉🙏",
  };

  await sendEmail(options);

  createSendToken(newUser, 201, res);
});

// Protects Routes
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // Get token and check if it exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1].toString();
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in!. Please login to gain access', 401)
    ); // 401 - Unauthorized
  }
  // Token verification
  const decoded = verifyAccessToken(token.toString());

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('This user no longer exist', 401));
  }

  // Check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again.', 401)
    );
  }

  // Grant user access to route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
  // Get token and check if it exists
  if (req.cookies.jwt) {
    try {
      // Token verification
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.CBA_ACCESS_TOKEN_SECRET
      );

      // Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // Check if user changed password after token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next;
    }
  }
  next();
};

// Forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get User based on password provided
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError('There is no user with the provided email address', 404)
    );
  }
  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // Send token via user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const link = `<a href=${resetURL}', target="_blank">Here</a>`;

    const options = {
      email: req.body.email,
      subject: 'Password Reset!!',
      message: `Forgot your password? Click the link to reset your password: ${link}`,
    };

    await sendEmail(options);

    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email', 500));
  }
});

// Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // Check if token is still valid / not expired -- set new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save(); // No need to turn off validator as it's required

  // Update passwordChangedAt property in userModel

  // Log in user -- send JWT
  createSendToken(user, 200, res);
});

// Updating password of a logged in user
exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // Check if POSTed password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Password Incorrect. Try again!!', 401));
  }

  // Update Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // Log user in -- send JWT
  createSendToken(user, 200, res);
});