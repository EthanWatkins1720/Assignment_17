const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const upload = multer({ dest: __dirname + "/public/images" });

mongoose.connect("mongodb+srv://ethanwatkins1720:EthanW@assignment17.eqc8fnh.mongodb.net/?retryWrites=true&w=majority")
    .then(() => console.log("Connected to mongodb"))
    .catch((error) => console.log("Couldn't connect to mongodb", error));

const albumSchema = new mongoose.Schema({
    // _id: mongoose.SchemaTypes.ObjectId,
    name: String,
    band: String,
    genre: String,
    year: String,
    members: [String],
    cover: String,
})

const Album = mongoose.model("Album", albumSchema);

app.get("/",(req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/api/data", (req, res) => {
    getAlbums(res);
});

const getAlbums = async(res) => {
    const albums = await Album.find();
    res.send(albums);
}

app.get("api/data/:id", (req, res) => {
    getAlbum(res, req.params.id);
});

const getAlbum = async(res, id) => {
    const album = await Album.findOne({_id:id});
    res.send(album);
}

app.post("/api/data", upload.single("cover"), (req, res) => {
    const result = validateAlbum(req.body);
    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const album = new Album({
        name: req.body.name,
        band: req.body.band,
        genre: req.body.genre,
        year: req.body.year,
    })

    if (req.body.members) {
        album.members = req.body.members.split(",");
    }

    if (req.file) {
        album.cover = "images/" + req.file.filename;
    }

    createAlbum(res, album);
});

const createAlbum = async(res, album) => {
    const result = await album.save();
    res.send(album);
}

app.put("/api/data/:id", upload.single("cover"), (req, res) => {
    const result = validateAlbum(req.body);
    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    updateAlbum(req, res);
});

const updateAlbum = async(req, res) => {
    let fieldsToUpdate = {
        name:req.body.name,
        band:req.body.band,
        genre:req.body.genre,
        year:req.body.year,
    }

    if (req.body.members) {
        fieldsToUpdate.members = req.body.members.split(",");
    }

    if (req.file) {
        fieldsToUpdate.img = "images/" + req.file.filename;
    }

    const results = await Album.updateOne({_id:req.params.id}, fieldsToUpdate);
    res.send(results);
}

app.delete("/api/data/:id", (req, res) => {
    removeAlbums(res, req.params.id);
});

const removeAlbums = async(res, id) => {
    const album = await Album.findByIdAndDelete(id);
    res.send(album);
}

const validateAlbum = (album) => {
    const schema = Joi.object({
        _id: Joi.allow(""),
        name: Joi.string().min(1).required(),
        band: Joi.string().min(1).required(),
        genre: Joi.string().min(3).required(),
        year: Joi.string().required(),
        members: Joi.allow(""),
    });
    return schema.validate(album);
};

app.listen(3000, () => {
    console.log("How can I help you?")
});