import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    assignedUser: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    completionStatus: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

export default mongoose.model('Task', TaskSchema)