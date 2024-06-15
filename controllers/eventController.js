import EventManagement from '../models/eventModel.js';

export const createEvent = async (req, res) => {
  try {
    const event = await EventManagement.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

export const getEvent = async (req, res) => {
  try {
    const event = await EventManagement.find();
    res.status(200).json({
      success: true,
      result: event.length,
      event,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
