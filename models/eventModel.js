import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
  },
  eventDescription: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const EventManagement = mongoose.model('Event', eventSchema);
export default EventManagement;
