const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const fs = require('fs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const upload = require('./multerConfig');
const setupSocket = require('./socketConfig');

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
//this ll make user accesss the uploaded files, 1.3 hr finding this
app.use("/uploads", express.static("uploads"));

// Read the table schema file
const tableSchema = fs.readFileSync('./tableSchema.sql', 'utf8');

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
    return res.status(401).json({ message: "User doesn't exists" });
  }
  // Check if the provided password matches the hashed password stored in the database
  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid password, try again!" });
  }

  // Generate JWT
  const token = jwt.sign({ userid: user.id, username: user.name, role: user.role, imageurl:user.imageurl }, secretKey, { expiresIn: '30d' });

  res.json({token});

});

app.post("/api/signup", (req, res) => {
  const { email, name, password, role, cid } = req.body;

  // Hash the password //10 is salt value
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    } else {

      const date = new Date();

      pool.query(
        "INSERT INTO users (email, name, password, role, cid, created_on) VALUES ($1, $2, $3, $4, $5, $6)",
        [email, name, hash, role, cid, date],
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

// Protected route
app.get('/protected', authenticateTokenAPI, (req, res) => {
  res.json({ message: 'Protected endpoint accessed successfully' });
});

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
    subject: "LaTshong One-Time Password",
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

//upload post
app.patch('/api/post', upload, async (req, res) => {
  try {
    const { description, postby } = req.body;

    const media_type = 'p';
    const postdate = new Date();
    console.log(req.body);

    const files = req.files.image;
    console.log(files)
    const filepaths = files.map(file => file.path);

    // insert the post data into the database
    const { rows } = await pool.query(
      `INSERT INTO posts 
      (_desc, postby, media_type, images, postdate) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [description, postby, media_type, filepaths, postdate]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

//all posts, userid
app.get("/api/get_post/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM posts WHERE postby = $1", [id]);
    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/job_post", authenticateTokenAPI, (req, res) => {
    try {
      const { job_title, job_description, job_requirements, job_salary, postby, 
        location, nature, vacancy_no, location_, remark} = req.body;
      const postdate = new Date();
      // console.log(req.body);
      const status = 'o';

      // insert the post data into the database
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

//particular post by post id //this doesnt require token user user have to view w/o login
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

//api to get all job posts posted by 

//applicants {}
app.put("/api/update_job_post", authenticateTokenAPI, async (req, res) => {
  try {
    const { userid, postid } = req.body;

    if (postid) {
      const jobPost = await pool.query("SELECT applicants FROM job_posts WHERE id = $1", [postid]);
      const applicants = jobPost.rows[0].applicants;

      if (applicants.includes(userid)) {
        // User has already applied, so remove them from the applicants array
        await pool.query("UPDATE job_posts SET applicants = array_remove(applicants, $1) WHERE id = $2", [userid, postid]);
        res.status(200).send({isApply:false});
      } else {
        // User hasn't applied, so add them to the applicants array
        await pool.query("UPDATE job_posts SET applicants = array_append(applicants, $1) WHERE id = $2", [userid, postid]);
        res.status(200).send({isApply:true});
      }
    } else {
      return res.status(400).send("Invalid update request");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error updating job post");
  }
});

//mutiple user info for array of users
// app.get("/api/get_user_info", authenticateTokenAPI, async (req, res) => {
//   const { userArray } = req.query;

//   console.log(userArray)

//   try {
//     const query = `SELECT id, name, imageurl FROM users WHERE id IN (${userArray.join(",")})`;
//     const { rows } = await pool.query(query);
//     res.json(rows);
//   } catch (error) {
//     console.log(error);
//   }
// });

//same as above but takes multiple arrays
app.get("/api/get_user_info_", authenticateTokenAPI, async (req, res) => {
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

//user info
app.get("/api/get_user_info/:id", authenticateTokenAPI, async (req, res) => {
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

const fetchMessage = async (roomId) => {
  console.log('fetchMessage');
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

//user info // fetch imageurl n last chat message as t or false
app.get("/api/chat_rooms/:id", authenticateTokenAPI, async (req, res) => {
  const id = req.params.id; // userid
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
      SELECT DISTINCT ON (room_id) *
      FROM messages
      WHERE room_id::text = ANY($1)
      ORDER BY room_id, date DESC;
    `;
    const messagesValues = [roomIds];
    const { rows: messages } = await pool.query(messagesQuery, messagesValues);

    // Create a map to store the latest message for each room
    const latestMessagesMap = new Map();
    messages.forEach((message) => {
      if (!latestMessagesMap.has(message.room_id)) {
        latestMessagesMap.set(message.room_id, message);
      }
    });

    // Combine chat rooms and latest messages based on room_id
    const result = chatRooms.map((chatRoom) => {
      const latestMessage = latestMessagesMap.get(chatRoom.room_id);
      return {
        ...chatRoom,
        message: latestMessage ? latestMessage.message : null,
        message_type: latestMessage ? latestMessage.message_type : null,
        date: latestMessage ? latestMessage.date : null,
        message_by_userid: latestMessage ? latestMessage.userid : null,
      };
    });

    console.log(result);
    res.json(result);
  } catch (error) {
    console.log(error);
  }
});

//update user password using userid
app.put("/api/updatePassword/:userid", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { userid } = req.params;

    console.log(userid, currentPassword, newPassword)
    // Check if current password matches the password in the database
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

    // Hash the new password and update the password in the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userid,
    ]);

    res.json({ msg: "Password updated!" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

//update user profile
app.patch('/api/updateProfile', upload, async (req, res) => {
  try {
    const { userid } = req.body;
    console.log(req.body);

    const files = req.files.image;
    console.log(files)

    const filepaths = files.map(file => file.path);

    const { rows } = await pool.query("UPDATE users SET imageurl = $1 WHERE id = $2  RETURNING *", [ filepaths, userid ]);

    res.status(201).json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// api to handle post status close and open
// Update job post status by ID
app.put("/api/update_job_post_status/:id", authenticateTokenAPI, async (req, res) => {
  try {
    const { id } = req.params;

    // Retrieve the current status and dates of the job post
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

    // Determine the new status based on the current status
    if (currentStatus === "o") {
      newStatus = "c";
      updatedDate = new Date(); // Set the closedate to the current date/time
    } else if (currentStatus === "c") {
      newStatus = "o";
      updatedDate = null; // Set the closedate to null when changing status to open
    } else {
      return res.status(400).json({ error: "Invalid status. The status should be 'o' or 'c'." });
    }

    // Update the job post status and dates in the database
    const updateQuery = `UPDATE job_posts SET status = $1, closedate = $2, postdate = CASE WHEN $3 = 'o' THEN $2 ELSE postdate END WHERE id = $4`;
    await pool.query(updateQuery, [newStatus, updatedDate, new Date(), id]);

    res.status(200).json({ message: "Job post status updated successfully.", newStatus });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while updating the job post status." });
  }
});

//api to delete job post by id
// Delete job post by ID
app.delete("/api/delete_job_post/:id", authenticateTokenAPI, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the job post exists before attempting to delete
    const checkQuery = "SELECT id FROM job_posts WHERE id = $1";
    const { rows } = await pool.query(checkQuery, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Job post not found." });
    }

    // Delete the job post
    const deleteQuery = "DELETE FROM job_posts WHERE id = $1";
    await pool.query(deleteQuery, [id]);

    res.status(200).json({ message: "Job post deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while deleting the job post." });
  }
});

//api to update the applicants
// Move the user from applicants to accepted_applicants and vice versa
app.put("/api/move_user_to_accepted/:jobPostId/:userId", authenticateTokenAPI, async (req, res) => {
  try {
    const { jobPostId, userId } = req.params;

    // Check if the job post exists before attempting to update
    const checkQuery = "SELECT id, applicants, accepted_applicants FROM job_posts WHERE id = $1";
    const { rows } = await pool.query(checkQuery, [jobPostId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Job post not found." });
    }

    const jobPost = rows[0];
    const applicantIndex = jobPost.applicants.indexOf(parseInt(userId, 10));
    const acceptedApplicantIndex = jobPost.accepted_applicants.indexOf(parseInt(userId, 10));

    if (applicantIndex !== -1) {
      // Move the user ID from applicants to accepted_applicants
      jobPost.applicants.splice(applicantIndex, 1); // Remove from applicants
      jobPost.accepted_applicants.push(userId); // Add to accepted_applicants
    } else if (acceptedApplicantIndex !== -1) {
      // Move the user ID from accepted_applicants to applicants
      jobPost.accepted_applicants.splice(acceptedApplicantIndex, 1); // Remove from accepted_applicants
      jobPost.applicants.push(userId); // Add to applicants
    } else {
      return res.status(404).json({ error: "User not found in applicants list or accepted_applicants list." });
    }

    // Create shallow copies of the arrays before updating the database
    const updatedApplicants = jobPost.applicants.slice();
    const updatedAcceptedApplicants = jobPost.accepted_applicants.slice();

    // Update the job post in the database with the modified arrays
    const updateQuery = "UPDATE job_posts SET applicants = $1, accepted_applicants = $2 WHERE id = $3";
    await pool.query(updateQuery, [updatedApplicants, updatedAcceptedApplicants, jobPostId]);

    res.status(200).json({ message: "User moved successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while moving the user." });
  }
});

app.get("/api/get_job_post_location", async (req, res) => {//token not required
  try {
    const { rows } = await pool.query(`SELECT id, location, job_title FROM job_posts;`);
    // console.log("rows", rows);
    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
  }
});

//search //token not required
app.get("/api/search_job", async (req, res) => {
  try {
    const { query } = req.query; // Get the search query from the request
    // Define the search query
    const searchQuery = `
      SELECT job_title, job_description FROM job_posts WHERE job_title ILIKE $1 OR job_description ILIKE $1 OR job_requirements ILIKE $1
      OR nature ILIKE $1 OR location_ ILIKE $1 OR job_salary ILIKE $1`;

    // Execute the search query
    const result = await pool.query(searchQuery, [`%${query}%`]);

    // Send the search results as the API response
    res.json(result.rows);
  } catch (err) {
    console.error("Error occurred:", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

//update user profile
app.patch('/api/upload_attachement', upload, async (req, res) => {
  try {
    const { roomId, userid } = req.body;
    console.log(req.body);

    const files = req.files.image;
    console.log(files)

    const filepaths = files.map(file => file.path);

    let message_type;

    // Assuming you want to check for MIME types like 'application/*' or 'image/*':
    if (files.some(file => file.mimetype.startsWith('application/'))) {
      message_type = 'a';
    } else if (files.some(file => file.mimetype.startsWith('audio/'))) {
      message_type = 'a';
    } else if (files.some(file => file.mimetype.startsWith('video/'))) {
      message_type = 'a';
    } else if (files.some(file => file.mimetype.startsWith('image/'))) {
      message_type = 'i';
    } else {
      // Set a default value or handle other mime types if necessary
      message_type = '-';
    }

    const date = new Date();

    // insert the post data into the database
    const { rows } = await pool.query(
      `INSERT INTO messages 
      (room_id, message, userid, message_type, date) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [roomId, filepaths, userid, message_type, date]
    );
      console.log(rows)

     // Insert attachment details into the 'attachment_details' table
     const attachmentDetails = files.map(file => {
      return {
        file_name: file.originalname,
        file_size: file.size,
        file_uri: file.path,
        message_id: messageId
      };
    });

    await pool.query(
      `INSERT INTO attachment_details (file_name, file_size, file_uri, message_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [attachmentDetails.map(att => att.file_name), attachmentDetails.map(att => att.file_size), attachmentDetails.map(att => att.file_uri), messageId]
    );
    // Emit an event to inform clients about the new file
    io.emit('messageAdded', 
    {id:rows[0].id, userid:rows[0].userid, roomId, message:rows[0].message, message_type:rows[0].message_type, date });

    res.status(201).json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

//api to delte posts // profile posts

// app.listen(3000, () => {
//     console.log("Server listening on port 3000");
//   });
  
// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});