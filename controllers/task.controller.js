import Task from '../models/task.model.js';
import User from '../models/user.model.js';
import { createSuccess } from '../utils/success.js';
import { createError } from '../utils/error.js';

export const createTask = async (req, res) => {
    try {
        const { title, description, assignedUser, dueDate } = req.body;

        const user = await User.findOne({ username: assignedUser });
        if (!user) {
            return res.status(400).json(createError(400, 'Assigned user does not exist.'));
        }
        const task = new Task({
            title,
            description,
            assignedUser,
            dueDate,
        });

        await task.save();
        res.status(201).json(createSuccess('Task has been created.', task));
    } catch (error) {
        console.error(error);
        res.status(500).json(createError(500, 'Internal server error during task creation.'));
    }
};

export const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(createSuccess('Tasks have been fetched.', tasks));
    } catch (error) {
        console.error(error);
        res.status(500).json(createError(500, 'Internal server error during tasks fetching.'));
    }
};

export const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json(createError(404, 'Task not found'))
        }
        res.status(200).json(createSuccess('Task has been fetched.', task));
    } catch (error) {
        console.error(error);
        res.status(500).json(createError(500, 'Internal server error during task fetching.'));
    }
};

const getTaskStatistics = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const statistics = await Task.aggregate([
            {
                $group: {
                    _id: null,
                    totalTasks: { $sum: 1 },
                    completedTasks: { $sum: { $cond: [{ $eq: ['$completionStatus', true] }, 1, 0] } },
                    completedTasksLast7Days: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$completionStatus', true] },
                                        { $gte: ['$createdAt', sevenDaysAgo] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]);

        const result = statistics[0] || {
            totalTasks: 0,
            completedTasks: 0,
            completedTasksLast7Days: 0,
        };
        return result;
    } catch (error) {
        console.error(error);
        res.status(500).json(createError(500, 'Internal server error during task statistics fetching.'));
    }
};

export const updateTask = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const { assignedUser, ...updatedTask } = req.body;

        if (assignedUser) {
            const user = await User.findOne({ username: assignedUser });
            if (!user) {
                return res.status(400).json(createError(400, 'Assigned user does not exist.'));
            }
        }

        const task = await Task.findByIdAndUpdate(taskId, updatedTask, { new: true });

        if (!task) {
            return res.status(404).json(createError(404, 'Task not found'));
        }

        if (updatedTask.completionStatus === true) {
            const statistics = await getTaskStatistics();
            res.status(200).json(createSuccess('Task has been updated.', { task, statistics }));
        } else {
            res.status(200).json(createSuccess('Task has been updated.', task));
        }
    } catch (error) {
        console.error(error);
        res.status(500).json(createError(500, 'Internal Server Error'));
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.taskId);
        if (!task) {
            return res.status(404).json(createError(404, 'Task not found'));
        }
        res.status(204).json(createSuccess('Task has been deleted.'));
    } catch (error) {
        console.error(error);
        res.status(500).json(createError(500, 'Internal server error during task deleting.'));
    }
};
