import mongoose from 'mongoose'; // Use ES6 import

// Define the schema for the Withdrawal model
const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model for user references
    required: true,
  },
  selectedNetwork: {
    type: String,
    enum: ['USDT', 'TRX'],
    required: true,
  },
  withdrawAmount: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  receiveAmount: {
    type: Number,
    required: true,
  },
  withdrawPin: {
    type: String,
    required: true, // In a real-world scenario, you would hash this before saving
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the model
const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal; // Correct export syntax
