const nodemailer = require("nodemailer");

const mailer = (email, OTP, text) => {
  let userNameMail = process.env.SENDER_EMAIL,
    applicationPassword = process.env.SENDER_EMAIL_PASSWORD;
  var transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    secureConnection: true, // TLS requires secureConnection to be false
    port: 465, 
    auth: {
      user: userNameMail,
      pass: applicationPassword,
    },
    from : {
      name: 'info@abmsapp.com',
      address: 'info@abmsapp.com'
    }
});
  var mailOptions = {
    from : {
      name: 'info@abmsapp.com',
      address: 'info@abmsapp.com'
    },
    to: email,
    subject: `PROPY!! LOGIN OTP`,
    html: `<p>Your ${text} OTP is ${OTP}</p>`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error , "error")
    }

  });
};


const sendMail = (email, body, content) => {
  let userNameMail = process.env.SENDER_EMAIL,
  applicationPassword = process.env.SENDER_EMAIL_PASSWORD;
  var transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    secureConnection: true, // TLS requires secureConnection to be false
    port: 465, 
    auth: {
      user: userNameMail,
      pass: applicationPassword,
    },
    from : {
      name: 'info@abmsapp.com',
      address: 'info@abmsapp.com'
    }
});
  var mailOptions = {
    from : {
      name: 'info@abmsapp.com',
      address: 'info@abmsapp.com'
    },
    to: email,
    subject: body,
    html: content,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(errro)
    }
  });
};

const sendPasswordMailer = (email, password) => {
  let userNameMail = process.env.SENDER_EMAIL,
    applicationPassword = process.env.SENDER_EMAIL_PASSWORD;
    var transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      secureConnection: true, // TLS requires secureConnection to be false
      port: 465, 
      auth: {
        user: userNameMail,
        pass: applicationPassword,
      },
      from : {
        name: 'info@abmsapp.com',
        address: 'info@abmsapp.com'
      }
  });
  var mailOptions = {
    from : {
      name: 'info@abmsapp.com',
      address: 'info@abmsapp.com'
    },to: email,
    subject: `PROPY Login Password`,
    html: `<p>Propy Welcome's you.Your Login password is ${password}.</p>`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    }

  });
};

module.exports = { mailer, sendPasswordMailer, sendMail }