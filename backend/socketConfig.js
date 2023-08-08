const socketIo = require('socket.io');
const pool = require('./db');
const { v4: uuidv4 } = require('uuid');//to generate random uid 

function setupSocket(server) {
  const io = socketIo(server);

  // Socket.IO logic can be added here

 // Define Socket.IO event handlers
    io.on('connection', (socket) => {
    console.log('A client connected.');
    
    socket.on('joinChat', async (data) => {
      const { user1, user2 } = data;
      console.log('joinChat');
  
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
  
    socket.on('addMessage', async(data) => {
      console.log('addMessage');
  
      const { userid, message, roomId } = data;
      // include message_type
  
      const date = new Date();
      //   console.log(date,'date');
      const query = 'INSERT INTO messages (userid, room_id, message, date) VALUES ($1, $2, $3, $4) RETURNING id';
      const values = [userid, roomId, message, date ];
  
      pool.query(query, values, (error, result) => {
        if (error) {
          console.error('Error adding message:', error);
        } else {
          const id = result.rows[0].id; // Get the ID of the newly added message
  
          console.log('Message added successfully');
          // Emit the newly added message to all clients in the room
          io.to(roomId).emit('messageAdded', { id, userid, roomId, message, message_type:'t', date });
        }
      });
     
    });
    
    // it is better to use post to upload file then multer, complicate on both client and sever side

    // Listen for the 'UnReadMessage' event from the client
    socket.on('UnReadMessage', async (data) => {
      const { userid } = data;
     // Fetch the updated unread count after marking messages as read
     const unreadCount = await fetchUnreadMessageCount(userid);

     socket.emit('UnReadMessageResult', unreadCount);
       console.log(unreadCount);
    });

     // Event to mark all messages in a room as read
     socket.on('markRoomMessagesAsRead', async (data) => {
      const { roomId, userid } = data;
      try {
        // Update the "unread" status of all messages in the room with the given roomId
        // and where the userid is not equal to the specified userid and is also in chat_rooms.
        await pool.query(
          'UPDATE messages SET unread = FALSE WHERE room_id = $1 AND userid != $2 AND (userid = (SELECT user1 FROM chat_rooms WHERE room_id = $1) OR userid = (SELECT user2 FROM chat_rooms WHERE room_id = $1))',
          [roomId, userid]
        );
        console.log('All messages in room marked as read:', roomId);

        // // // Fetch the updated unread count after marking messages as read
        // const unreadCount = await fetchUnreadMessageCount(userid);

        // socket.emit('UnReadMessageResult', unreadCount);
        //   console.log(unreadCount);
          
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    //establist a socket connection
    socket.on('connectUser', async(data) => {
      const {userid} = data;
      console.log('user connected online', userid);
    })

    // Clean up on client disconnect
    socket.on('disconnect', () => {
      console.log('A client disconnected.');
      // Perform any necessary clean-up tasks
    });
  });
  
  const fetchMessage = async (roomId) => {
    console.log('fetchMessage');
    try {
      const result = await pool.query(`
        SELECT m.*, ad.file_name, ad.file_size, ad.file_uri
        FROM messages AS m
        LEFT JOIN attachment_details AS ad ON m.id = ad.message_id
        WHERE m.room_id = $1
        ORDER BY m.date ASC
      `, [roomId]);


    // Extract the data from the query result
    const messages = result.rows;
  
      console.log(messages)
  
      return messages;
    } catch (error) {
      console.error('Error occurred while fetching data from the database:', error);
      throw error;
    }
  };

  const fetchUnreadMessageCount = async (userid) => {
    try {
      const chatRoomsQuery = `
        SELECT chat_rooms.room_id,
          COUNT(*) FILTER (WHERE messages.unread = true) AS unread_count
        FROM chat_rooms
        INNER JOIN messages ON chat_rooms.room_id = messages.room_id
        WHERE (chat_rooms.user1 = $1 OR chat_rooms.user2 = $1) AND messages.userid <> $1
        GROUP BY chat_rooms.room_id;
      `;
      const chatRoomsValues = [userid];
      const { rows } = await pool.query(chatRoomsQuery, chatRoomsValues);

      // Calculate the total unread count for the user
      const totalUnreadCount = rows.reduce((total, row) => total + row.unread_count, 0);

      return totalUnreadCount;
    } catch (error) {
      console.log(error);
      return 0;
    }
  };

  return io;
}

module.exports = setupSocket;
