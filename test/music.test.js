import express from 'express';
import { createTask, getAllTasks } from '../controllers/task.controller.js';
import * as userModel from '../models/user.model.js';
import * as taskModel from '../models/task.model.js';

jest.mock('../models/user.model.js');
jest.mock('../models/task.model.js');

const app = express();
app.use(express.json());

describe('Task Controller', () => {
  describe('createTask', () => {
    test('should create a task', async () => {
      const req = {
        body: {
          title: 'Test Task',
          description: 'This is a test task',
          assignedUser: 'testuser',
          dueDate: '2023-12-31',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      userModel.default.findOne.mockResolvedValue({  });

      await createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getAllTasks', () => {
    test('should get all tasks', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      taskModel.default.find.mockResolvedValue([ ]);

      await getAllTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });

});
