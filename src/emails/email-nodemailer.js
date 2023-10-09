const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const nodeEmail = process.env.NODEMAILER_EMAIL;
const nodePass = process.env.NODEMAILER_PASS;

/** send mail from testing account */
const testingAccount = async (req, res) => {
  /** testing account */
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  let message = {
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: "bar@example.com, baz@example.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Successfully Register with us.", // plain text body
    html: "<b>Successfully Register with us.</b>", // html body
  };

  transporter
    .sendMail(message)
    .then((info) => {
      return res.status(201).json({
        msg: "you should receive an email",
        info: info.messageId,
        preview: nodemailer.getTestMessageUrl(info),
      });
    })
    .catch((error) => {
      return res.status(500).json({ error });
    });

  // res.status(201).json("Signup Successfully...!");
};

/** send mail from real gmail account */
exports.nodeMailerSend = async (userEmail, subject, text) => {
  let config = {
    service: "gmail",
    auth: {
      user: nodeEmail,
      pass: nodePass,
    },
  };

  let transporter = nodemailer.createTransport(config);

  // let MailGenerator = new Mailgen({
  //   theme: "default",
  //   product: {
  //     name: "Mailgen",
  //     link: "https://mailgen.js/",
  //   },
  // });

  // let response = {
  //   body: {
  //     name: "Daily Tuition",
  //     intro: "Your bill has arrived!",
  //     table: {
  //       data: [
  //         {
  //           item: "Nodemailer Stack Book",
  //           description: "A Backend application",
  //           price: "$10.99",
  //         },
  //       ],
  //     },
  //     outro: "Looking forward to do more business",
  //   },
  // };

  // let mail = MailGenerator.generate(response);

  let message = {
    from: nodeEmail,
    to: userEmail,
    subject: subject,
    text: text,
    // html: mail,
  };
  try {
    const res = await transporter.sendMail(message);
    console.log(res);
    console.log("you should receive an email");
    return res;
  } catch (error) {
    // console.log(error);
    throw new Error(error);
  }

  // res.status(201).json("getBill Successfully...!");
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
