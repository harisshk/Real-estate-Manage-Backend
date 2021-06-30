const OTPAuth = require("../models/auth");
const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const { generateRandom4DigitOTP } = require("../methods/otpGenerate");
const { mailer } = require("../methods/nodemailer");
const jwt = require("jsonwebtoken");

exports.generateOTP = async (req, res) => {
  OTPAuth.findOne({ user: req.body.user })
    .then((user) => {
      const otp = generateRandom4DigitOTP();
      let otpStoreError = false;
      if (user) {
        OTPAuth.findOneAndUpdate(
          { user: req.body.user },
          { $set: { otp: otp } }
        )
          .then((updateResponse) => {
            otpStoreError = false;
          })
          .catch(() => {
            otpStoreError = true;
          });
      } else {
        let newOTP = new OTPAuth({
          user: req.body.user,
          otp: otp,
        });
        newOTP
          .save()
          .then((updateResponse) => {
            otpStoreError = false;
          })
          .catch(() => {
            otpStoreError = true;
          });
      }
      mailer(req.body.user, otp);
      res.status(StatusCodes.OK).send({
        success: true,
        message:"OTP successsfully sent"
      });
    })
    .catch((error) => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        success: false,
        message:"OTP successsfully sent"
      });
    });
};

exports.validateOTP = (req, res) => {
  OTPAuth.findOne({ user: req.body.user })
    .then((userOTP) => {
      if (userOTP) {
        if (userOTP.otp === req.body.otp) {
          let token = jwt.sign({ _id: userOTP._id }, "secretCode");
          OTPAuth.findOneAndRemove({ user: req.body.user })
            .then(() =>
              res.status(StatusCodes.OK).send({
                success: true,
                token: token,
                message: "OTP is verified",
              })
            )
            .catch((error) => {
              res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
                success: false,
              });
            });
        } else {
          res.status(StatusCodes.OK).send({
            success: false,
            message: "OTP is invalid",
          });
        }
      } else {
        res.status(StatusCodes.OK).send({
          success: false,
          message: "OTP is invalid",
        });
      }
    })
    .catch((error) => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        success: false,
      });
    });
};
