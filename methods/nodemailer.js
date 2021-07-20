const nodemailer = require("nodemailer");

const mailer = (email, OTP, text) => {
  let userNameMail = "hari.jsmith494@gmail.com",
    applicationPassword = "fqcjwpduyiuhwgun";
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: userNameMail,
      pass: applicationPassword,
    },
  });
  var mailOptions = {
    from: "hari.jsmith494@gmail.com",
    to: email,
    subject: `OTP`,
    html: `<p>your ${text} OTP is ${OTP}</p>`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {

    }

  });
};


const sendMail = (email, body, content) => {
  let userNameMail = "hari.jsmith494@gmail.com",
    applicationPassword = "fqcjwpduyiuhwgun";
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: userNameMail,
      pass: applicationPassword,
    },
  });
  var mailOptions = {
    from: "hari.jsmith494@gmail.com",
    to: email,
    subject: body,
    html: content,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return res.status(400).json({ error: true, message: "Error in sending Invoice Mail" })
    }

  });
};

const sendPasswordMailer = (email, password) => {
  let userNameMail = "hari.jsmith494@gmail.com",
    applicationPassword = "fqcjwpduyiuhwgun";
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: userNameMail,
      pass: applicationPassword,
    },
  });
  var mailOptions = {
    from: "hari.jsmith494@gmail.com",
    to: email,
    subject: `Password`,
    html: `<p>your login password is ${password}. Kindly change the password </p>`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {

    }

  });
};

module.exports = { mailer, sendPasswordMailer, sendMail }