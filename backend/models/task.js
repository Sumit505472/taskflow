import mongoose from "mongoose";
const taskSchema = new mongoose.Schema({
  title: { 
    type: String,
     required: true 
    },
  description: String,
  status: { 
    type: String,
     enum: ['todo', 'in-progress', 'done'],
      default: 'todo'
      },
  priority: { 
    type: String,
     enum: ['low', 'medium', 'high'],
      default: 'medium' 
    },
  dueDate: Date,
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User' 
    },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User', 
     required: true },
  documents: [{
    name: String,
    key: String,      // S3 key
    url: String,      // S3 URL or local path
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
export default mongoose.model('Task', taskSchema);