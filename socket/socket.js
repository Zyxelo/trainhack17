
import Messages from '../models/messages.models';


export default (socket) => {
  console.log('a user connected');
  socket.on('room-connect', (roomId, fn) =>{
    console.log('joined room: ', roomId);
    socket.join(roomId);
    Messages.find({q_id: roomId},'name text sender time', (err, messages) => {

      if (err) throw err;
      fn({messages});

    });
  });
  socket.on('chat message', (message, fn) => {
    socket.broadcast.to(message.q_id).emit('chat message', message);
    let newMessage = {
      q_id: message.q_id,
      text: message.message,
      sender: message.sender,
      time: message.time
    };

    let messages = new Messages(newMessage);

    messages.save(function(err) {
      if (err) throw err;

    });
  });
};