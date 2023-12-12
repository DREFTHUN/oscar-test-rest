require("dotenv").config()

const express = require("express")
const app = express()

const mongoose = require("mongoose")

mongoose.connect(process.env.DATABASE_URL)
const con = mongoose.connection

con.on("error", (error) => console.error(error))
con.once("open", () => console.log("Adatbázis kapcsolat létrejött"))

app.use(express.json())

app.listen(
    process.env.PORT,
    () => console.log("Elindítva: http://localhost:" + process.env.PORT)
)

const router = require("./routes/oscar")

app.use("/oscar", router)
app.use("/banners", express.static("banners"))