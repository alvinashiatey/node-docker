const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const session = require("express-session");
const redis = require("redis");
const cors = require("cors");
const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
} = require("./config/config");
let RedisStore = require("connect-redis")(session);
let redisClient = redis.createClient({
  host: REDIS_URL,
  port: REDIS_PORT,
});

app.use(cors());
app.enable("trust proxy");
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    saveUninitialized: false,
    secret: SESSION_SECRET,
    cookie: {
      secure: false,
      resave: false,
      saveUninitialized: false,
      httpOnly: true,
      maxAge: 60000,
    },
  })
);

app.use(express.json());

const postRouter = require("./routes/postRoute");
const userRouter = require("./routes/userRoute");

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;
console.log(mongoURL);
const mongoose = require("mongoose");
mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((res) => console.log("success"))
  .catch((e) => console.log(e.message));

app.get("/", (req, res) => {
  res.send("Severe storm warning");
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});
