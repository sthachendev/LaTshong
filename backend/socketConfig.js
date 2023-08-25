const socketIo = require('socket.io');
const pool = require('./db');
const { v4: uuidv4 } = require('uuid');

function setupSocket(server) {
  const io = socketIo(server);

    io.on('connection', (socket) => {

    socket.on('joinChat', async (data) => {
      const { user1, user2 } = data;
  
      let roomId;
  
      try {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
  
          const query1 = 'SELECT room_id FROM chat_rooms WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)';
          const values1 = [user1, user2];
          const result1 = await client.query(query1, values1);
  
          if (result1.rows.length > 0) {
            roomId = result1.rows[0].room_id;
          } else {
            roomId = uuidv4(); 
  
            const query2 = 'INSERT INTO chat_rooms (room_id, user1, user2) VALUES ($1, $2, $3)';
            const values2 = [roomId, user1, user2];
            await client.query(query2, values2);
          }
  
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      } catch (error) {
        console.error('Error occurred:', error);
      }
  
      socket.join(roomId);

      io.to(roomId).emit('roomJoined', { roomId });

      const messages = await fetchMessage(roomId);
      io.to(roomId).emit('fetchMessages', { messages });

    });
  
    socket.on('addMessage', async(data) => {
  
      const { userid, message, roomId } = data;
  
      const date = new Date();
      const query = 'INSERT INTO messages (userid, room_id, message, date) VALUES ($1, $2, $3, $4) RETURNING id';
      const values = [userid, roomId, message, date ];
  
      pool.query(query, values, (error, result) => {
        if (error) {
          console.error('Error adding message:', error);
        } else {
          const id = result.rows[0].id; 
  
          io.to(roomId).emit('messageAdded', { id, userid, roomId, message, message_type:'t', date });
        }
      });
     
    });
    
    socket.on('UnReadMessage', async (data) => {
      const { roomId, userid } = data;
     const unreadCount = await fetchUnreadMessageCount(userid);

     io.to(roomId).emit('UnReadMessageResult', unreadCount);
    });

     socket.on('markRoomMessagesAsRead', async (data) => {
      const { roomId, userid } = data;
      try {
        await pool.query(
          'UPDATE messages SET unread = FALSE WHERE room_id = $1 AND userid != $2 AND (userid = (SELECT user1 FROM chat_rooms WHERE room_id = $1) OR userid = (SELECT user2 FROM chat_rooms WHERE room_id = $1))',
          [roomId, userid]
        );
          
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

  socket.on('requestOlderMessages', async({ roomId, lastMessageId }) => {
    const messages = await fetchMessagesById( roomId, lastMessageId);
    io.to(roomId).emit('fetchOlderMessages', { messages });
  });

    socket.on('disconnect', () => {
    });
  });
  
  const fetchMessage = async (roomId) => {
    try {
      const result = await pool.query(`
        SELECT m.*, ad.file_name, ad.file_size, ad.file_uri
        FROM messages AS m
        LEFT JOIN attachment_details AS ad ON m.id = ad.message_id
        WHERE m.room_id = $1
        ORDER BY m.date DESC LIMIT 10
      `, [roomId]);

    const messages = result.rows;
  
      return messages;
    } catch (error) {
      console.error('Error occurred while fetching data from the database:', error);
      throw error;
    }
  };

  const fetchMessagesById = async (roomId, lastMessageId) => {
    try {
      const result = await pool.query(`
        SELECT m.*, ad.file_name, ad.file_size, ad.file_uri
        FROM messages AS m
        LEFT JOIN attachment_details AS ad ON m.id = ad.message_id
        WHERE m.room_id = $1 AND m.id < $2
        ORDER BY m.date DESC
        LIMIT 10
      `, [roomId, lastMessageId]);
  
      const messages = result.rows;
  
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
