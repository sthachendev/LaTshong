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

const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);

//to generate random uid 
const { v4: uuidv4 } = require('uuid');

const PORT = 3000; // Replace with your desired port number

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
app.get('/protected', authenticateTokenAPI, (req, res) => {
  res.json({ message: 'Protected endpoint accessed successfully' });
});

// Middleware to authenticate JWT token
function authenticateTokenAPI(req, res, next) {
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

// Middleware to authenticate JWT token for Socket.IO
function authenticateTokenSocketIO(socket, next) {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication token required'));
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return next(new Error('Invalid token'));
    }

    // Attach the decoded token data to the socket object
    socket.decoded_token = decoded;

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

app.post("/api/job_post", authenticateTokenAPI, (req, res) => {
    try {
      const { job_title, job_description, job_requirements, posttype, job_salary, postby, 
        location, status, applicants, accepted_applicants, rejected_applicants } = req.body;
      const postdate = new Date();
      // console.log(req.body);

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

//all
app.get("/api/get_job_post", async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT job_posts.*, users.name, users.email, users.imageurl
      FROM job_posts
      JOIN users ON job_posts.postBy = users.id;
    `);
    // console.log("rows", rows);
    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
  }
});

//particular
app.get("/api/get_job_post/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT job_posts.*, users.name, users.email, users.imageurl
      FROM job_posts
      JOIN users ON job_posts.postBy = users.id
      WHERE job_posts.id = $1`,
      [id]
    );

    // console.log("rows", rows);
    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching the job post." });
  }
});

//applicants {}
app.put("/api/update_job_post", async (req, res) => {
  try {
  const {userid, postid} = req.body;

  if (postid) {
  await pool.query("UPDATE job_posts SET applicants = array_append(applicants, $1) WHERE id = $2", [userid, postid]);
  } else {
    return res.status(400).send("Invalid update request");
  }
    res.status(200).send("Job post updated");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error updating user email");
  }
});

//mutiple user info
app.get("/api/get_user_info", async (req, res) => {
  const { userArray } = req.query;

  console.log(userArray)

  try {
    const query = `SELECT * FROM users WHERE id IN (${userArray.join(",")})`;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.log(error);
  }
});

//user info
app.get("/api/get_user_info/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE id = ${id}`
    );
    // console.log(rows);
    res.json(rows);
  } catch (error) {
    console.log(error);
  }
})

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

// Configure Socket.IO middleware for JWT authentication
io.use(authenticateTokenSocketIO);

// Define Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('A client connected.');
  
  socket.on('joinChat', async (data) => {
    const { user1, user2 } = data;

    let roomId;

    try {
      // Check if user already has a room ID assigned
      const client = await pool.connect();
      try {
        // Start a transaction
        await client.query('BEGIN');

        const query1 = 'SELECT room_id FROM chat_rooms WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)';
        const values1 = [user1, user2];
        const result1 = await client.query(query1, values1);

        if (result1.rows.length > 0) {
          roomId = result1.rows[0].room_id;
          console.log('room exits', roomId)
        } else {
          roomId = uuidv4(); // Generate a random UUID as the room ID

          const query2 = 'INSERT INTO chat_rooms (room_id, user1, user2) VALUES ($1, $2, $3)';
          const values2 = [roomId, user1, user2];
          await client.query(query2, values2);
        }

        // Commit the transaction
        await client.query('COMMIT');
      } catch (error) {
        // Rollback the transaction in case of any error
        await client.query('ROLLBACK');
        throw error;
      } finally {
        // Release the client back to the pool
        client.release();
      }
    } catch (error) {
      console.error('Error occurred:', error);
      // Handle the error as required
    }

    console.log(`User ${user1} joined chat room ${roomId} with User ${user2}`);

    // Fetch data from the database
    const messages = await fetchMessage(roomId);
    socket.emit('fetchMessages', { messages });

    // Send the room ID to the frontend
    socket.emit('roomJoined', { roomId });

    // Join the chat room
    socket.join(roomId);
  });

  // socket.on('message', (data) => {
  //   const date = new Date();
  //   console.log(date,'date');

  //   console.log('data from frontend', data);
  //   // Process the data and emit updates to clients if needed

  // });

  socket.on('addMessage', async(data) => {
    const { userid, message, roomId } = data;
    const date = new Date();
    //   console.log(date,'date');
    const query = 'INSERT INTO messages (userid, room_id, message, date) VALUES ($1, $2, $3, $4)';
    const values = [userid, roomId, message, date ];

    pool.query(query, values, (error, result) => {
      if (error) {
        console.error('Error adding message:', error);
      } else {
        console.log('Message added successfully');
        // Emit the newly added message to all clients in the room
        // io.to(roomId).emit('messageAdded', { userid, roomId, message });
      }
    });

    const messages = await fetchMessage(roomId);
    socket.emit('fetchMessages', { messages });
  });

  // Clean up on client disconnect
  socket.on('disconnect', () => {
    console.log('A client disconnected.');
    // Perform any necessary clean-up tasks
  });
});

const fetchMessage = async (roomId) => {
  try {
    // Perform the database query
    const result = await pool.query('SELECT * FROM messages WHERE room_id = $1', [roomId]);

    // Extract the data from the query result
    const messages = result.rows;

    console.log(messages)

    return messages;
  } catch (error) {
    console.error('Error occurred while fetching data from the database:', error);
    throw error;
  }
};

// app.post('/api/add_msg', (req, res) => {
//   // Handle the API request
//   // Process the data and emit an event to connected clients
//   const {message, userid, } = req.body;
//   console.log(message);

//   io.emit('dataUpdate', data);

//   res.json({ message: 'Update processed' });
// });

// app.listen(3000, () => {
//     console.log("Server listening on port 3000");
//   });
  
// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});