import mongoose from 'mongoose';

// Define the schema for the Order model
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
  format: { type: String, default: 'dst - Tajima' },
  location: { type: String, required: true },
  designName: { type: String, required: true },
  file: { type: String }, // You can store file path or URL here
  fileUrl: { type: String },
  userFiles: { type: [String], default: [] },
  // URL for the uploaded file
  height: { type: String, required: true },
  width: { type: String, required: true },
  colorName: { type: String, required: true },
  numberOfColors: { type: String, required: true },
  fabric: { type: String, required: true },
  expectedDelivery: { type: Date, required: true },
  comments: { type: String },
  isRush: { type: Boolean, default: false },  // Added Rush status
  price: { type: Number, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Completed'] }, 
  paymentStatus: { type: String, default: 'Pending', enum: ['Pending', 'Success', 'Failed'] }, // Payment status field added
  fileSent: { type: Boolean, default: false }, // Added price field
}, { timestamps: true });

// Middleware to adjust the price if the order is rush
orderSchema.pre('save', function(next) {
  // if (this.isRush) {
  //   this.price += 5; // Add $5 if rush
  // }
  next();
});

// Create the Order model from the schema
const Order = mongoose.model('Order', orderSchema);

export { Order };
