const express = require("express")
const router = express.Router()

const Oscar = require("../models/oscar")

const multer = require("multer")

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "banners")
    },
    filename: function(req, file, cb) {
        cb(null, (file.fieldname + " " + new Date().getTime() + " " + req.body.name + " " + req.body.movie + "." + (file.mimetype.substring(6, 9))).replace(/ /g, "-"))
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpeg") {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
})

function logError(res, e, status) {
    console.log(e.message)
    res.status(status || 500).send({ message: e.message })
}

// Teljes lista lekérése, külön jelezve ha nyertes is
router.get("/", async (req, res) => {
    try {
        const nominees = await Oscar.find()
        res.send(nominees)
    } catch(e) {
        logError(res, e)
    }
})

// Lista lekérése, csak a nyertesekkel ellátva
router.get("/winners", async (req, res) => {
    try {
        const nominees = await Oscar.find({winner: true})
        res.send(nominees)
    } catch(e) {
        logError(res, e)
    }
})

/* Új jelölt felvétele:
    jelölt neve [String],
    film címe [String],
    rövid leírás [String],
    borítókép [Image],
    nyertes [Bool])
*/
router.post("/", upload.single("banner"), async (req, res) => {
    const body = req.body

    const nominee = new Oscar({
        name: body.name,
        winner: body.winner,
        movie: body.movie,
        description: body.description,
        image: req.file.path
    })

    try {
        const newNominee = await nominee.save()
        console.log(newNominee)
        res.status(201).send(newNominee)
    } catch(e) {
        logError(res, e, 400)
    }
})

async function getNominee(req, res, next) {
    let nominee

    try {
        nominee = await Oscar.findById(req.params.id)

        if (nominee == null) {
            return res.status(404).send({ message: "Jelölt nem található" })
        }
    } catch(e) {
        return logError(res, e)
    }

    res.nominee = nominee
    next()
}

// Külön lekérés (ID-vel lekérés)
router.get("/:id", getNominee, (req, res) => {
    res.status(200).send(res.nominee)
})

const checks = ["name", "winner", "movie", "description", "image"]

// Jelölt adatainak módosítása
router.patch("/:id", getNominee, async (req, res) => {
    for (i = 0; i < checks.length; i++) {
        const current = checks[i]

        if (req.body[current] != null) {
            res.nominee[current] = req.body[current]
        }
    }

    try {
        const updatedNominee = await res.nominee.save()
        res.status(200).send(res.nominee)
    } catch(e) {
        return logError(res, e, 400)
    }
})

module.exports = router