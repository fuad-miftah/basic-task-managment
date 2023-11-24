import express from "express"
import dotenv from "dotenv";
import authRoute from "./routes/auth.routes.js";
import taskRoute from "./routes/task.routes.js";
import connectToDatabase from "./config/db.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const port = process.env.PORT || 8000

connectToDatabase();


app.use(cookieParser())
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/tasks", taskRoute);


app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).json({
    success: "error",
    status: errorStatus,
    message: errorMessage
  });
});

app.listen(port, () => {
  console.log(`api started at port ${port}`)
})  