const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const fs = require('fs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const upload = require('./multerConfig');
const setupSocket = require('./socketConfig');
const path = require('path');

// Secret key for signing JWT
const secretKey = 'latshong123';

const app = express();

const folderPath = "./uploads";

// Create the folder if it doesn't exist
if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

const httpServer = require('http').createServer(app);
const io = setupSocket(httpServer);

const PORT = 3000; // Replace with your desired port number

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

// Serve static files from the "uploads" directory
app.use("/uploads", express.static("uploads"));

// Read the table schema file
const tableSchema = fs.readFileSync('./tableSchema.sql', 'utf8');

// Execute the SQL script to create the tables
pool.query(tableSchema, (error) => {
  if (error) {
    console.error('Error creating table:', error);
  } else {
    console.log('Table created successfully!');
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
    return res.status(401).json({ message: "User doesn't exists" });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid password, try again!" });
  }

  // Generate JWT
  const token = jwt.sign({ userid: user.id, username: user.name, role: user.role, imageurl:user.imageurl }, secretKey, { expiresIn: '30d' });

  res.json({token});

});

app.post("/api/signup", (req, res) => {
  const { email, name, password, role } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    } else {

      const date = new Date();

      pool.query(
        "INSERT INTO users (email, name, password, role, created_on) VALUES ($1, $2, $3, $4, $5)",
        [email, name, hash, role, date],
        (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
          } else {
            res.status(200).json({ message: "User added" });
          }
        }
      );
    }
  });
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

    socket.decoded_token = decoded;

    next();
  });
}

const nodemailer = require("nodemailer");

// create transporter object
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// function to generate random 6-digit alphanumeric code
function generateRandomCode() {
  let characters =
    "0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

app.post("/api/otp", async (req, res) => {
  const { email } = req.body;

  const otp = generateRandomCode();
  // console.log(otp);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "LaConnect One Time Password",
    html: `<p>Use this OTP <strong>${otp}</strong> before 15 min.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent");

    res.send({ success: true, otp: otp });
  } catch (error) {
    console.log(error);
    res.send({ success: false });
  }
});

app.patch('/api/post-certificates', upload, async (req, res) => {
  try {
    const { postby } = req.body;

    const postdate = new Date();

    const files = req.files.image;
    const filepaths = files.map(file => file.path);

    const { rows } = await pool.query(
      `INSERT INTO posts 
      (postby, images, postdate) VALUES ($1, $2, $3) RETURNING *`,
      [postby, filepaths, postdate]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/:userid/post-certificates", async (req, res) => {
  try {
    const { userid } = req.params;
    const { rows } = await pool.query("SELECT * FROM posts WHERE postby = $1", [userid]);
    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/post-jobs", authenticateTokenAPI, (req, res) => {
    try {
      const { job_title, job_description, job_requirements, job_salary, postby, 
        location, nature, vacancy_no, location_, remark} = req.body;
      const postdate = new Date();
      const status = 'o';
      const { rows } = pool.query(
        `INSERT INTO job_posts 
        (job_title, job_description, job_requirements, job_salary, postby, postdate, location, status, nature, vacancy_no, location_, remark) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [job_title, job_description, job_requirements, job_salary, postby, postdate, location, status, nature, vacancy_no, location_, remark]
      );

      res.status(201).json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
});

app.get("/api/post-jobs", async (req, res) => {
  try {
    const { page, pageSize } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const itemsPerPage = parseInt(pageSize, 10) || 10;
    const offset = (pageNumber - 1) * itemsPerPage;
    const query = `SELECT job_posts.*, users.name, users.email, users.imageurl, users.verification_status
                   FROM job_posts
                   JOIN users ON job_posts.postBy = users.id  
                   ORDER BY job_posts.postdate DESC
                   LIMIT $1 OFFSET $2;`;
    const { rows } = await pool.query(query, [itemsPerPage, offset]);
    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching job posts." });
  }
});

app.get("/api/post-jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT job_posts.*, users.name, users.email, users.imageurl, users.verification_status
      FROM job_posts
      JOIN users ON job_posts.postBy = users.id
      WHERE job_posts.id = $1`,
      [id]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching the job post." });
  }
});

app.get("/api/:userid/post-jobs", async (req, res) => {
  try {
    const { userid } = req.params;

    const { rows } = await pool.query(
      `SELECT job_posts.*, users.name, users.email, users.imageurl
      FROM job_posts
      JOIN users ON job_posts.postBy = users.id
      WHERE job_posts.postBy = $1`,
      [userid]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching the job posts." });
  }
});

app.put("/api/post-jobs/apply", authenticateTokenAPI, async (req, res) => {
  try {
    const { userid, postid } = req.body;

    if (postid && userid) {
      const jobPost = await pool.query("SELECT applicants FROM job_posts WHERE id = $1", [postid]);
      
      if (jobPost.rows.length === 0) {
        return res.status(404).send("Job post not found");
      }
      
      const applicants = jobPost.rows[0].applicants;

      const userIdInt = parseInt(userid);

      if (applicants.includes(userIdInt)) {
        // User has already applied, so remove them from the applicants array
        const updatedApplicants = applicants.filter(applicantId => applicantId !== userIdInt);
        await pool.query("UPDATE job_posts SET applicants = $1 WHERE id = $2", [updatedApplicants, postid]);
        res.status(200).send({ isApply: false });
      } else {
        // User hasn't applied, so add them to the applicants array
        const updatedApplicants = [...applicants, userIdInt];
        await pool.query("UPDATE job_posts SET applicants = $1 WHERE id = $2", [updatedApplicants, postid]);
        res.status(200).send({ isApply: true });
      }
    } else {
      return res.status(400).send("Invalid update request");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error updating job post");
  }
});

app.get("/api/post-jobs/apply/users", authenticateTokenAPI, async (req, res) => {
  const { applicants, acceptedApplicants } = req.query;
  
  try {
    const response = {};
    
    if (applicants && applicants.length > 0) {
      const queryApplicants = `SELECT id, name, imageurl FROM users WHERE id IN (${applicants.join(",")})`;
      const { rows: applicantsData } = await pool.query(queryApplicants);
      response.applicants = applicantsData;
    }
    
    if (acceptedApplicants && acceptedApplicants.length > 0) {
      const queryAccepted = `SELECT id, name, imageurl FROM users WHERE id IN (${acceptedApplicants.join(",")})`;
      const { rows: acceptedData } = await pool.query(queryAccepted);
      response.acceptedApplicants = acceptedData;
    }
    
    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/users/:userid", authenticateTokenAPI, async (req, res) => {
  const id = req.params.userid;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE id = ${id}`
    );
    res.json(rows);
  } catch (error) {
    console.log(error);
  }
})

// Configure Socket.IO middleware for JWT authentication
io.use(authenticateTokenSocketIO);

app.get("/api/chat_rooms/:id", authenticateTokenAPI, async (req, res) => {
  const id = req.params.id; 
  try {
    const chatRoomsQuery = `
      SELECT chat_rooms.*, 
        u1.name AS user1_name,
        u1.imageUrl AS user1_imageUrl,
        u2.name AS user2_name,
        u2.imageUrl AS user2_imageUrl,
        CASE
          WHEN u1.id = $1 THEN u2.imageUrl
          ELSE u1.imageUrl
        END AS other_user_imageUrl
      FROM chat_rooms
      INNER JOIN users AS u1 ON chat_rooms.user1 = u1.id
      INNER JOIN users AS u2 ON chat_rooms.user2 = u2.id
      WHERE chat_rooms.user1 = $1 OR chat_rooms.user2 = $1
    `;
    const chatRoomsValues = [id];
    const { rows: chatRooms } = await pool.query(chatRoomsQuery, chatRoomsValues);

    const roomIds = chatRooms.map((room) => room.room_id);
    const messagesQuery = `
      SELECT DISTINCT ON (room_id) *,
        COUNT(*) FILTER (WHERE unread = true) OVER (PARTITION BY room_id) AS unread_count
      FROM messages
      WHERE room_id = ANY($1)
      ORDER BY room_id, date DESC;
    `;
    const messagesValues = [roomIds];
    const { rows: messages } = await pool.query(messagesQuery, messagesValues);

    const latestMessagesMap = new Map();
    messages.forEach((message) => {
      if (!latestMessagesMap.has(message.room_id)) {
        latestMessagesMap.set(message.room_id, message);
      }
    });

    // Combine chat rooms and latest messages based on the latest message date
    const result = chatRooms.map((chatRoom) => {
      const latestMessage = latestMessagesMap.get(chatRoom.room_id);
      return {
        ...chatRoom,
        message: latestMessage ? latestMessage.message : null,
        message_type: latestMessage ? latestMessage.message_type : null,
        date: latestMessage ? latestMessage.date : null,
        message_by_userid: latestMessage ? latestMessage.userid : null,
        unread_count: latestMessage ? latestMessage.unread_count : 0,
      };
    });

    // Sort the result based on the latest message date in descending order
    result.sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    });

    res.json(result);

  } catch (error) {
    console.log(error);
  }
});

app.put("/api/users/:userid/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { userid } = req.params;

    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      userid,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ msg: "User not found!" });
    }
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.rows[0].password
    );
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userid,
    ]);

    res.json({ msg: "Password updated." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

app.put("/api/users/password", async (req, res) => {
  try {
    const { password, email } = req.body;
  const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ msg: "User not found!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email]);

    res.json({ msg: "Password updated successfully!" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

app.patch('/api/users/profile', upload, async (req, res) => {
  try {
    const { userid } = req.body;

    const files = req.files.image;

    const filepaths = files.map(file => file.path);

    const { rows } = await pool.query("UPDATE users SET imageurl = $1 WHERE id = $2  RETURNING *", [ filepaths, userid ]);

    res.status(201).json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.put("/api/post-jobs/:id/status", authenticateTokenAPI, async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      "SELECT status, postdate, closedate FROM job_posts WHERE id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Job post not found." });
    }

    const currentStatus = rows[0].status;
    let newStatus;
    let updatedDate;

    if (currentStatus === "o") {
      newStatus = "c";
      updatedDate = new Date(); 
    } else if (currentStatus === "c") {
      newStatus = "o";
      updatedDate = null; 
    } else {
      return res.status(400).json({ error: "Invalid status. The status should be 'o' or 'c'." });
    }

    const updateQuery = `UPDATE job_posts SET status = $1, closedate = $2, postdate = CASE WHEN $3 = 'o' THEN $2 ELSE postdate END WHERE id = $4`;
    await pool.query(updateQuery, [newStatus, updatedDate, new Date(), id]);

    res.status(200).json({ message: "Job post status updated successfully.", newStatus });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while updating the job post status." });
  }
});

app.delete("/api/post-jobs/:id", authenticateTokenAPI, async (req, res) => {
  try {
    const { id } = req.params;

    const checkQuery = "SELECT id FROM job_posts WHERE id = $1";
    const { rows } = await pool.query(checkQuery, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Job post not found." });
    }

    const deleteQuery = "DELETE FROM job_posts WHERE id = $1";
    await pool.query(deleteQuery, [id]);

    res.status(200).json({ message: "Job post deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while deleting the job post." });
  }
});

app.put("/api/post-jobs/:id/:userid", authenticateTokenAPI, async (req, res) => {
  try {
    const { id, userid } = req.params;

    const checkQuery = "SELECT id, applicants, accepted_applicants FROM job_posts WHERE id = $1";
    const { rows } = await pool.query(checkQuery, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Job post not found." });
    }

    const jobPost = rows[0];
    const applicantIndex = jobPost.applicants.indexOf(parseInt(userid, 10));
    const acceptedApplicantIndex = jobPost.accepted_applicants.indexOf(parseInt(userid, 10));

    if (applicantIndex !== -1) {
      // Move the user ID from applicants to accepted_applicants
      jobPost.applicants.splice(applicantIndex, 1); // Remove from applicants
      jobPost.accepted_applicants.push(userid); // Add to accepted_applicants
    } else if (acceptedApplicantIndex !== -1) {
      // Move the user ID from accepted_applicants to applicants
      jobPost.accepted_applicants.splice(acceptedApplicantIndex, 1); // Remove from accepted_applicants
      jobPost.applicants.push(userid); // Add to applicants
    } else {
      return res.status(404).json({ error: "User not found in applicants list or accepted_applicants list." });
    }

    // Create shallow copies of the arrays before updating the database
    const updatedApplicants = jobPost.applicants.slice();
    const updatedAcceptedApplicants = jobPost.accepted_applicants.slice();

    // Update the job post in the database with the modified arrays
    const updateQuery = "UPDATE job_posts SET applicants = $1, accepted_applicants = $2 WHERE id = $3";
    await pool.query(updateQuery, [updatedApplicants, updatedAcceptedApplicants, id]);

    res.status(200).json({ message: "User moved successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while moving the user." });
  }
});

app.get("/api/location", async (req, res) => {//token not required
  try {
    const { rows } = await pool.query(`SELECT id, location, job_title FROM job_posts;`);
    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/search/jobs", async (req, res) => {
  try {
    const { query } = req.query; 

    const searchQuery = `
      SELECT id, job_title, job_description FROM job_posts WHERE job_title ILIKE $1 OR job_description ILIKE $1 OR job_requirements ILIKE $1
      OR nature ILIKE $1 OR location_ ILIKE $1 OR job_salary ILIKE $1
      LIMIT 800`; 

    const result = await pool.query(searchQuery, [`%${query}%`]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error occurred:", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.patch('/api/chats/upload-attachement', upload, async (req, res) => {
  try {
    const { roomId, userid } = req.body;

    const file = req.files.image[0]; 

    const filepath = file.path;

    let message_type;

    if (file.mimetype.startsWith('application/')) {
      message_type = 'a';
    } else if (file.mimetype.startsWith('audio/')) {
      message_type = 'a';
    } else if (file.mimetype.startsWith('video/')) {
      message_type = 'a';
    } else if (file.mimetype.startsWith('image/')) {
      message_type = 'i';
    } else {
      message_type = 'a';
    }

    const date = new Date();

    const { rows } = await pool.query(
      `INSERT INTO messages 
      (room_id, message, userid, message_type, date) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [roomId, filepath, userid, message_type, date]
    );

    const file_name = file.originalname;
    const file_size = file.size;
    const file_uri = file.path;
    const file_type = file.mimetype;
    const message_id = rows[0].id;

    await pool.query(
      `INSERT INTO attachment_details (file_name, file_size, file_uri, file_type, message_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [file_name, file_size, file_uri, file_type, message_id]
    );

    io.emit('messageAdded', 
    {id:rows[0].id, userid:rows[0].userid, roomId, message:rows[0].message, message_type:rows[0].message_type, date,
    file_name, file_size, file_uri, file_type});

    res.status(201).json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.patch('/api/post-feeds', upload, async (req, res) => {
  try {
    const { _desc, postby, media_type  } = req.body;

    const postdate = new Date();

    const files = req.files.image;
    const filepaths = files.map(file => file.path);

    const { rows } = await pool.query(
      `INSERT INTO feed_posts 
      (_desc, postby, media_type, media_uri, postdate) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [_desc, postby, media_type, filepaths, postdate]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get('/api/post-feeds', async (req, res) => {
  try {
    const { page, pageSize } = req.query;
    const pageNumber = parseInt(page, 5) || 1;
    const itemsPerPage = parseInt(pageSize, 10) || 10;

    const offset = (pageNumber - 1) * itemsPerPage;

    const { rows } = await pool.query(`
      SELECT feed_posts.*, users.name, users.imageurl, users.verification_status
      FROM feed_posts
      INNER JOIN users ON feed_posts.postby = users.id
      ORDER BY feed_posts.postdate DESC
      LIMIT $1 OFFSET $2
    `, [itemsPerPage, offset]);

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/post-feeds/:id", async (req, res) => {//postid
  try {
    const id = req.params.id;

    const { rows } = await pool.query(
      `
      SELECT feed_posts.*, users.name, users.imageurl
      FROM feed_posts
      INNER JOIN users ON feed_posts.postby = users.id
      WHERE feed_posts.id = $1
    `,
      [id]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get('/api/:userid/post-feeds', async (req, res) => {
  try {
    const { userid } = req.params;
    const { page, pageSize} = req.query;
    const offset = (page - 1) * pageSize;

    const { rows } = await pool.query(`
      SELECT feed_posts.*, users.name, users.imageurl
      FROM feed_posts
      INNER JOIN users ON feed_posts.postby = users.id
      WHERE feed_posts.postby = $1
      ORDER BY feed_posts.postdate DESC
      LIMIT $2 OFFSET $3
    `, [userid, pageSize, offset]);

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post('/api/post-jobs/save', authenticateTokenAPI, async (req, res) => {
  try {
    const { postid, userid } = req.body;

    let isSaved = false; 

    const { rows } = await pool.query(
      'SELECT postid FROM user_saved_posts WHERE userid = $1',
      [userid]
    );

    if (rows.length > 0) {
      const savedPostIds = rows[0].postid;
      const updatedPostIds = savedPostIds.includes(postid)
        ? savedPostIds.filter((id) => id !== postid)
        : [...savedPostIds, postid];

      await pool.query(
        'UPDATE user_saved_posts SET postid = $1 WHERE userid = $2',
        [updatedPostIds, userid]
      );

      isSaved = updatedPostIds.includes(postid);
    } else {
      await pool.query(
        'INSERT INTO user_saved_posts (userid, postid) VALUES ($1, $2)',
        [userid, [postid]]
      );

      isSaved = true; 
    }

    res.status(200).json({ message: 'Data added successfully', isSaved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get("/api/post-jobs/save/:userid", authenticateTokenAPI, async (req, res) => {
  try {
    const { userid } = req.params;

    const { rows } = await pool.query(`
      SELECT job_posts.*
      FROM job_posts
      INNER JOIN user_saved_posts ON job_posts.id = ANY(user_saved_posts.postid)
      WHERE user_saved_posts.userid = $1;
    `, [userid]);

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/search/users", async (req, res) => {
  try {
    const { query } = req.query; 
    const searchQuery = `
    SELECT id, name, email, bio, verification_status FROM users WHERE (name ILIKE $1 OR email ILIKE $1 OR bio ILIKE $1) AND role = 'js' LIMIT 300`;

    const result = await pool.query(searchQuery, [`%${query}%`]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error occurred:", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.patch('/api/users/:userid/bio', async (req, res) => {
  try {
    const { bio } = req.body;
    const { userid } = req.params;

    const { rowCount } = await pool.query(
      'UPDATE users SET bio = $1 WHERE id = $2',
      [bio, userid]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User bio updated successfully', updated:true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.put("/api/post-feeds/:postid/report/:userid", authenticateTokenAPI, async (req, res) => {
  try {
    const { postid, userid } = req.params;

    // Update the reportedby array by adding the new userid, but only if it doesn't exist in the array
    const updateQuery = "UPDATE feed_posts SET reportedby = array_append(reportedby, $1) WHERE id = $2 AND NOT $1 = ANY (reportedby)";
    const result = await pool.query(updateQuery, [userid, postid]);

    if (result.rowCount === 0) {
      return res.status(200).json({ message: "User is already in the reportedby array." });
    }

    res.status(200).json({ message: "User added to reportedby array successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while updating the reportedby array." });
  }
});

app.delete("/api/post-feeds/:postid", authenticateTokenAPI, async (req, res) => {
  try {
    const { postid } = req.params;

    const checkQuery = "SELECT id FROM feed_posts WHERE id = $1";
    const checkResult = await pool.query(checkQuery, [postid]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Post not found." });
    }

    const deleteQuery = "DELETE FROM feed_posts WHERE id = $1";
    await pool.query(deleteQuery, [postid]);

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while deleting the post." });
  }
});

app.delete("/api/post-certificates/:postid", authenticateTokenAPI, async (req, res) => {
  try {
    const { postid } = req.params;

    const checkQuery = "SELECT id FROM posts WHERE id = $1";
    const checkResult = await pool.query(checkQuery, [postid]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Post not found." });
    }

    const deleteQuery = "DELETE FROM posts WHERE id = $1";
    await pool.query(deleteQuery, [postid]);

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while deleting the post." });
  }
});

app.get('/api/dashboard',authenticateTokenAPI, async (req, res) => {
  try {
    const userCountQuery = 'SELECT role, COUNT(*) FROM users GROUP BY role';
    const totalUserCountQuery = 'SELECT COUNT(*) FROM users';
    const feedPostsCountQuery = 'SELECT COUNT(*) FROM feed_posts';
    const jobPostsCountQuery = 'SELECT COUNT(*) FROM job_posts';
    const databaseSizeQuery = 'SELECT pg_size_pretty(pg_database_size(current_database())) AS database_size';

    const [userCountResult, totalUserCountResult, feedPostsCountResult, jobPostsCountResult, databaseSizeResult] = await Promise.all([
      pool.query(userCountQuery),
      pool.query(totalUserCountQuery),
      pool.query(feedPostsCountQuery),
      pool.query(jobPostsCountQuery),
      pool.query(databaseSizeQuery),
    ]);

    const userCountByRole = {};
    userCountResult.rows.forEach((row) => {
      userCountByRole[row.role] = parseInt(row.count);
    });

    const totalUserCount = parseInt(totalUserCountResult.rows[0].count);
    const feedPostsCount = parseInt(feedPostsCountResult.rows[0].count);
    const jobPostsCount = parseInt(jobPostsCountResult.rows[0].count);
    const databaseSize = databaseSizeResult.rows[0].database_size;

    const uploadsFolderPath = path.join(__dirname, 'uploads'); 
    const mediaSize = getMediaSizeSync(uploadsFolderPath);

    const dashboardData = {
      userCountByRole,
      totalUserCount,
      feedPostsCount,
      jobPostsCount,
      databaseSize,
      mediaSize,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function getMediaSizeSync(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);
    let totalSize = 0;
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    });
    return totalSize;
  } catch (error) {
    console.error('Error calculating media size:', error);
    return 0;
  }
}

app.get("/api/users", authenticateTokenAPI, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE role = $1 OR role = $2", ['js', 'em']);
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/users/:id", authenticateTokenAPI, async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/users/name/:id", authenticateTokenAPI, async (req, res) => {
  const userId = req.params.id;
  const { name } = req.body;

  try {
    const result = await pool.query("UPDATE users SET name = $1 WHERE id = $2", [name, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User's name updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/posts/report', async (req, res) => {
  try {
    // Fetch reported feed posts from the database, joined with user information
    const { rows: reportedFeedPosts } = await pool.query(`
      SELECT feed_posts.id, feed_posts.reportedby, users.name, users.email, 'feed_post' AS posttype
      FROM feed_posts
      INNER JOIN users ON feed_posts.postby = users.id
      WHERE ARRAY_LENGTH(feed_posts.reportedby, 1) > 0
      ORDER BY feed_posts.postdate DESC
    `);

    // Fetch reported job posts from the database, joined with user information
    const { rows: reportedJobPosts } = await pool.query(`
      SELECT job_posts.id, job_posts.reportedby, users.name, users.email, 'job_post' AS posttype
      FROM job_posts
      INNER JOIN users ON job_posts.postby = users.id
      WHERE ARRAY_LENGTH(job_posts.reportedby, 1) > 0
      ORDER BY job_posts.postdate DESC
    `);

    // Combine both sets of reported posts
    const reportedPosts = [...reportedFeedPosts, ...reportedJobPosts];

    res.status(200).json(reportedPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/post-jobs/:postid/report/:userid", authenticateTokenAPI, async (req, res) => {
  try {
    const { postid, userid } = req.params;

    // Update the reportedby array by adding the new userid, but only if it doesn't exist in the array
    const updateQuery = "UPDATE job_posts SET reportedby = array_append(reportedby, $1) WHERE id = $2 AND NOT $1 = ANY (reportedby)";
    const result = await pool.query(updateQuery, [userid, postid]);

    if (result.rowCount === 0) {
      // If no rows were updated, it means the userid already exists in the array
      return res.status(200).json({ message: "User is already in the reportedby array." });
    }

    res.status(200).json({ message: "User added to reportedby array successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while updating the reportedby array." });
  }
});

app.get('/api/unread_count/:userid', async (req, res) => {
  try {
    const { userid } = req.params; 

    const userIdInt = parseInt(userid, 10);

    if (isNaN(userIdInt)) {
      return res.status(400).json({ error: 'Invalid user ID provided.' });
    }

    const chatRoomsQuery = `
      SELECT chat_rooms.room_id,
        COUNT(*) FILTER (WHERE messages.unread = true) AS unread_count
      FROM chat_rooms
      INNER JOIN messages ON chat_rooms.room_id = messages.room_id
      WHERE (chat_rooms.user1 = $1 OR chat_rooms.user2 = $1) AND messages.userid <> $1
      GROUP BY chat_rooms.room_id;
    `;

    const { rows } = await pool.query(chatRoomsQuery, [userIdInt]);

    const unreadCount = rows.reduce((total, row) => total + row.unread_count, 0);

    res.json({ unreadCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

app.patch('/api/user/:userid/request-verification', async (req, res) => {
  try {
    const { userid } = req.params;

    const { rowCount, rows } = await pool.query(
      'SELECT verification_status FROM users WHERE id = $1',
      [userid]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verificationStatus = rows[0].verification_status;

    if (verificationStatus == 'not verified') {

      const updateResult = await pool.query(
        `UPDATE users SET verification_status = $1 WHERE id = $2 AND verification_status = 'not verified'`,
        ['pending', userid]
      );

      if (updateResult.rowCount === 0) {
        return res.status(200).json({ message: 'User verification is already in progress', status: 'pending' });
      }

      return res.status(200).json({ message: 'User verification process initiated', status: 'requested' });
    } else if (verificationStatus == 'verified') {
      return res.status(200).json({ message: 'User account is already verified', status: 'verified' });
    } else {
      return res.status(200).json({ message: 'Account verification is pending', status: 'pending' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.patch('/api/users/:userid/request-verification', authenticateTokenAPI, async (req, res) => {
  try {
    const { userid } = req.params;

    const { rowCount, rows } = await pool.query(
      'SELECT verification_status FROM users WHERE id = $1',
      [userid]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verificationStatus = rows[0].verification_status;

    if (verificationStatus != 'verified') {
      await pool.query(
        'UPDATE users SET verification_status = $1 WHERE id = $2',
        ['verified', userid]
      );

      return res.status(200).json({ message: 'User account successfully verified', status: 'verified' });
    } else {
      return res.status(200).json({ message: 'User account is already verified', status: 'verified' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.patch('/api/users/:userid/verify-account', authenticateTokenAPI, async (req, res) => {
  try {
    const { userid } = req.params;

    const { rowCount } = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userid]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await pool.query(
      'UPDATE users SET verification_status = $1 WHERE id = $2',
      ['verified', userid]
    );

    return res.status(200).json({ message: 'User account set as verified', status: 'verified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.patch('/api/users/:userid/revert-verification', authenticateTokenAPI, async (req, res) => {
  try {
    const { userid } = req.params;

    const { rowCount, rows } = await pool.query(
      'SELECT verification_status FROM users WHERE id = $1',
      [userid]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verificationStatus = rows[0].verification_status;

    if (verificationStatus == 'verified') {
      await pool.query(
        'UPDATE users SET verification_status = $1 WHERE id = $2',
        ['not verified', userid]
      );

      return res.status(200).json({ message: 'User account verification reverted', status: 'not verified' });
    } else if (verificationStatus === 'not verified') {
      return res.status(200).json({ message: 'User account verification is not verified', status: 'pending' });
    } else {
      return res.status(200).json({ message: 'User account is not verified', status: 'not verified' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.put("/api/nullify-report/post-jobs/:postid", authenticateTokenAPI, async (req, res) => {
  try {
    const { postid } = req.params;

    const updateQuery = "UPDATE job_posts SET reportedby = '{}' WHERE id = $1";
    const result = await pool.query(updateQuery, [postid]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Job post not found." });
    }

    res.status(200).json({ message: "Post report nullified." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while updating the reportedby array." });
  }
});

app.put("/api/nullify-report/post-feeds/:postid", authenticateTokenAPI, async (req, res) => {
  try {
    const { postid } = req.params;

    // Update the reportedby array to an empty array for the specified postid
    const updateQuery = "UPDATE feed_posts SET reportedby = '{}' WHERE id = $1";
    const result = await pool.query(updateQuery, [postid]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Post feed not found." });
    }

    res.status(200).json({ message: "Post report nullified." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while updating the reportedby array." });
  }
});

app.get('/api/users/:userid/exists', authenticateTokenAPI, async (req, res) => {
  const id = req.params.userid;
  try {
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (rows.length > 0) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while checking user existence.' });
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});