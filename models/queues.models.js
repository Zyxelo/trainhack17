import Mongoose from 'mongoose';
import shortid from 'shortid';

//Define queue model
const queueSchema = new Mongoose.Schema({
  _id: {
    type: String,
    'default': shortid.generate
  },
  thumbnail: String,
  queueTitle: String,
  queueCompany: String,
  queueCompanyID: String,
  queueEventDate:  Date,
  queueEndDate: Date,
  location: String,
  queueShortDescription: String,
  queueLongDescription: String,
  queueCategory: String,
  numberOfQueuers: Number,
  privacy: String,
  carousel: Array,
  spotifyUrl: String
});

export default Mongoose.model('Queue', queueSchema);