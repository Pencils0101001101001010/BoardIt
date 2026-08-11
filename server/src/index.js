const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const authRouter = require("./routes/auth");
const boardsRouter = require("./routes/boards");
const itemsRouter = require("./routes/items");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/boards", boardsRouter);
app.use("/api/items", itemsRouter);

app.get("/", (req, res) => res.send("BoardIt API is running"));

// basic error handler so thrown errors don't crash the process
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
