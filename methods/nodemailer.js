const nodemailer = require("nodemailer");
const mailer = (email,OTP) => {
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
    html: `<p>your login OTP is ${OTP}</p>`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
     
    }

  });
};

module.exports = {mailer}