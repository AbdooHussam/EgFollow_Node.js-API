const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const from = "abdelrahman.hossaam@gmail.com";

exports.sendEmail = async (email, subject, text) => {
  try {
    const res = await sgMail.send({
      to: email,
      from: from,
      subject: subject,
      text: text,
    });
    console.log(res);
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};

// توليد أرقام عشوائية بعدد معين
exports.generateRandomOTP = (length) => {
  if (length < 1) {
    throw new Error("يجب أن يكون طول الرقم أكبر من 0");
  }
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const randomOTP = Math.floor(Math.random() * (max - min + 1) + min);
  return randomOTP.toString();
};

// module.exports = {
//   sendEmail,
// };
