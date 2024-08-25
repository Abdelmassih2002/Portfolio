const express = require("express");
const router = express.Router();
const cors = require("cors");
const nodemailer = require("nodemailer");
require('dotenv').config(); // Load environment variables

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Adjust based on your frontend's URL
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use("/", router);

const contactEmail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

contactEmail.verify((error) => {
  if (error) {
    console.error("Error verifying email configuration:", error);
  } else {
    console.log("Email service ready to send.");
  }
});

router.post("/contact", (req, res) => {
  const { firstName, lastName, email, message, phone } = req.body;

  // Server-side validation example
  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ code: 400, status: "Validation Error", message: "Please fill in all required fields." });
  }

  const name = `${firstName} ${lastName}`;
  const mail = {
    from: name,
    to: process.env.EMAIL_USER,
    subject: "Contact Form Submission - Portfolio",
    html: `<p>Name: ${name}</p>
           <p>Email: ${email}</p>
           <p>Phone: ${phone}</p>
           <p>Message: ${message}</p>`,
  };
  contactEmail.sendMail(mail, (error) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ code: 500, status: "Error sending message", error });
    } else {
      console.log("Message sent successfully.");
      res.status(200).json({ code: 200, status: "Message Sent" });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
