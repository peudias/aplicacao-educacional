const express = require("express");
const multer = require("multer");
const path = require("path");

const uploadDirectory = path.join(__dirname, "api", "imgs-api");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const app = express();

app.use(express.static(__dirname));

app.post("/upload", upload.array("images", 3), (req, res) => {
    res.status(200).json({ message: "Imagens carregadas com sucesso!" });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
    console.log("Server at port 3000: http://localhost:3000/");
});
