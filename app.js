require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");


const dbconnection = require("./app/config/dbconfig.js");
dbconnection()
const authRoute = require("./app/routes/authRoutes.js");

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));




// Routes
app.use("/api/v1", authRoute);




const port = process.env.PORT || 3775;


app.listen(port, () => {
    console.log("Running successfully on port " + port)
})