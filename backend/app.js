const express = require("express");
//const ErrorHandler = require("./middleware/error");
const ErrorHandler = require("./utils/ErrorHandler")
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

// app.use(cors({
//   origin: 'https://eshop-tutorial-cefl.vercel.app',
//   credentials: true
// }));
const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}

app.use(cors(corsOptions))

app.use(express.json());
app.use(cookieParser());
app.use("/", express.static(path.join(__dirname,"./uploads")));
app.use("/test", (req, res) => {
  res.send("Hello world!");
});

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}

// import routes
const user = require("./controller/user");


app.use("/api/user", user);

// it's for ErrorHandling
app.use(ErrorHandler);

module.exports = app;
