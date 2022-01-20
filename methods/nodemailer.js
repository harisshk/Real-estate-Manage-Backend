const nodemailer = require("nodemailer");

const mailer = (email, OTP, text) => {
  let userNameMail = process.env.SENDER_EMAIL,
    applicationPassword = process.env.SENDER_EMAIL_PASSWORD;
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: userNameMail,
      pass: applicationPassword,
    },
    from : {
      name: 'info@abmsapp',
      address: 'info@abmsapp'
    }
});
  var mailOptions = {
    from : {
      name: 'info@abmsapp',
      address: 'info@abmsapp'
    },
    to: email,
    subject: `PROPY!! LOGIN OTP`,
    html: `<p>Your ${text} OTP is ${OTP}</p>`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {

    }

  });
};


const sendMail = (email, body, content) => {
  let userNameMail = process.env.SENDER_EMAIL,
  applicationPassword = process.env.SENDER_EMAIL_PASSWORD;
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: userNameMail,
      pass: applicationPassword,
    },
    from : {
      name: 'info@abmsapp',
      address: 'info@abmsapp'
    }
  });
  var mailOptions = {
    from : {
      name: 'info@abmsapp',
      address: 'info@abmsapp'
    },
    to: email,
    subject: body,
    html: content,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      throw error;
    }
  });
};

const sendPasswordMailer = (email, password) => {
  let userNameMail = process.env.SENDER_EMAIL,
    applicationPassword = process.env.SENDER_EMAIL_PASSWORD;
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: userNameMail,
      pass: applicationPassword,
    },
    from : {
      name: 'info@abmsapp',
      address: 'info@abmsapp'
    }
  });
  var mailOptions = {
    from : {
      name: 'info@abmsapp',
      address: 'info@abmsapp'
    },to: email,
    subject: `PROPY Login Password`,
    html: `<p>Propy Welcome's you.Your Login password is ${password}.</p>`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {

    }

  });
};

module.exports = { mailer, sendPasswordMailer, sendMail }