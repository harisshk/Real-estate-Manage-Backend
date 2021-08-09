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
    from : {
      name: 'info@stglobalsolutions.com',
      address: 'info@stglobalsolutions.com'
    }
});
  var mailOptions = {
    from : {
      name: 'info@stglobalsolutions.com',
      address: 'info@stglobalsolutions.com'
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
  let userNameMail = "hari.jsmith494@gmail.com",
    applicationPassword = "fqcjwpduyiuhwgun";
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: userNameMail,
      pass: applicationPassword,
    },
    from : {
      name: 'info@stglobalsolutions.com',
      address: 'info@stglobalsolutions.com'
    }
  });
  var mailOptions = {
    from : {
      name: 'info@stglobalsolutions.com',
      address: 'info@stglobalsolutions.com'
    },
    to: email,
    subject: body,
    html: content,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      throw error;
      // return res.status(400).json({ error: true, message: "Error in sending mail" })
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
    from : {
      name: 'info@stglobalsolutions.com',
      address: 'info@stglobalsolutions.com'
    }
  });
  var mailOptions = {
    from : {
      name: 'info@stglobalsolutions.com',
      address: 'info@stglobalsolutions.com'
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