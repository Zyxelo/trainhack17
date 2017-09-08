import Mongoose from 'mongoose';


//Define messages model
const messageSchema = new Mongoose.Schema({
  q_id: String,
  text: String,
  sender: String,
  time: Date

});

export default Mongoose.model('Messages', messageSchema);