const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const uploadDirectory = path.join(__dirname, "api", "imgs-api");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = crypto.randomBytes(8).toString("hex");
        cb(null, `${Date.now()}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });
const app = express();

app.use(express.static(path.join(__dirname)));

app.post("/upload", upload.array("images", 3), (req, res) => {
    console.log("Arquivos recebidos:", req.files);
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Nenhum arquivo foi carregado." });
    }
    res.status(200).json({ message: "Imagens carregadas com sucesso!" });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
    console.log("Server at port 3000: http://localhost:3000/");
});
