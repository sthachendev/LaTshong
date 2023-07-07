const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const cors = require("cors");
const fs = require('fs');
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');

// Secret key for signing JWT
const secretKey = 'latshong123';

dotenv.config();

const app = express();

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,

    //production
    // connectionString: process.env.DATABASE_URL,
    // ssl: {
    //   rejectUnauthorized: false // Add this line if you encounter SSL certificate validation errors
    // }

  });

const allowedOrigins = ["http://localhost:3000"];
//CORS allow frontend to communicate w backend

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not allow access from the specified origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json()); // add this line to use express.json() middleware
app.use(express.urlencoded({ extended: true }));

// Read the table schema file
const tableSchema = fs.readFileSync('./tables.sql', 'utf8');

// Execute the SQL script to create the tables
pool.query(tableSchema, (error) => {
  if (error) {
    console.error('Error creating table:', error);
    // Handle the error appropriately
  } else {
    console.log('Table created successfully!');
    // Continue with your application logic
  }
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected'});
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  // Check if the provided password matches the hashed password stored in the database
  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Generate JWT
  const token = jwt.sign({ userid: user.id, usename: user.name, role: user.role }, secretKey, { expiresIn: '30d' });

  res.json({token});

});

app.post("/api/signup", (req, res) => {
  const { email, name, password, role } = req.body;

  // Hash the password //10 is salt value
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    } else {
      pool.query(
        "INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4)",
        [email, name, hash, role],
        (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
          } else {
            console.log("User added");
            res.status(200).json({ message: "User added" });
          }
        }
      );
    }
  });
});

// Protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected endpoint accessed successfully' });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  });
}

const nodemailer = require("nodemailer");

// create transporter object
const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false,
  auth: {
    user: "soyecharo@outlook.com",
    pass: "Password@@2020",
  },
});

// function to generate random 6-digit alphanumeric code
function generateRandomCode() {
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

app.post("/api/getOTP", async (req, res) => {
  const { email } = req.body;

  const otp = generateRandomCode();
  console.log(otp);

  // create email message object with the OTP
  const mailOptions = {
    from: "soyecharo@outlook.com",
    to: email,
    subject: "LaTshong One Time Password",
    html: `<p>Use this OTP <strong>${otp}</strong> before 15 min.</p>`,
  };

  try {
    // send email message
    await transporter.sendMail(mailOptions);
    console.log("Email sent");

    res.send({ success: true, otp: otp });
  } catch (error) {
    console.log(error);
    res.send({ success: false });
  }
});

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = function (req, file, cb) {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and GIF files are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20 MB
  },
  fileFilter: fileFilter,
}).fields([{ name: "images", maxCount: 20 }]);

app.post("/api/post", (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      // An error occurred when uploading
      console.log(err);
      return res.status(400).json({ message: "Error uploading file." });
    }

    // Everything went fine
    console.log(req.file);
    try {
      const { description, location, postby, posttype, status, 
        applicants, accepted_applicants, rejected_applicants } = req.body;
      const postdate = new Date();
      console.log(req.body);

      // const filepaths = req.files.map(file => file.path); // get the image paths
      const filepaths = req.files["images"].map((file) => file.path);

      // insert the post data into the database
      const { rows } = await pool.query(
        `INSERT INTO posts 
        (description, location, postby, posttype, postdate, status, applicants, accepted_applicants, rejected_applicants, images) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [description, location, postby, posttype, postdate, status, applicants, accepted_applicants, rejected_applicants, filepaths]
      );

      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  });
});

app.post("/api/job_post", authenticateToken, (req, res) => {
    try {
      const { job_title, job_description, job_requirements, posttype, job_salary, postby, 
        location, status, applicants, accepted_applicants, rejected_applicants } = req.body;
      const postdate = new Date();
      console.log(req.body);

      // insert the post data into the database
      const { rows } = pool.query(
        `INSERT INTO job_posts 
        (job_title, job_description, job_requirements, job_salary, postby, postdate, location, status, applicants, accepted_applicants, rejected_applicants) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [job_title, job_description, job_requirements, job_salary, postby, postdate, location, status, applicants, accepted_applicants, rejected_applicants]
      );

      res.status(201);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
});

app.get("/api/get_job_post", async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT job_posts.*, users.name, users.email, users.imageurl
      FROM job_posts
      JOIN users ON job_posts.postBy = users.id;
    `);
    console.log("rows", rows);
    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/employer_post", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      // An error occurred when uploading
      console.log(err);
      return res.status(400).json({ message: "Error uploading file." });
    }

    console.log(req.file);
    try {
      const { description, postby } = req.body;
      const postdate = new Date();

      const filepaths = req.files["images"].map((file) => file.path);

      // insert the post data into the database
      const { rows } = await pool.query(
        `INSERT INTO posts 
        (description, postby, postdate, images) VALUES ($1, $2, $3, $4) RETURNING *`,
        [description, postby, postdate, filepaths]
      );

      res.status(201).json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  });
});

app.listen(3000, () => {
    console.log("Server listening on port 3000");
  });
  