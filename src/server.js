const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs").promises;
const { exec } = require("child_process");

const uploadDirectory = path.join("/tmp", "img");

async function ensureUploadDirectoryExists() {
    try {
        await fs.mkdir(uploadDirectory, { recursive: true });
        console.log(`Diretório de upload criado: ${uploadDirectory}`);
    } catch (err) {
        console.error(`Erro ao criar o diretório de upload: ${uploadDirectory}`, err);
    }
}

async function deleteOldFiles(directory) {
    try {
        const files = await fs.readdir(directory);
        console.log(`Arquivos encontrados para deletar: ${files.length}`);
        for (const file of files) {
            const filePath = path.join(directory, file);
            try {
                await fs.unlink(filePath);
                console.log(`Arquivo deletado: ${filePath}`);
            } catch (err) {
                if (err.code === "ENOENT") {
                    console.log(`Arquivo não encontrado: ${filePath}`);
                } else {
                    throw err;
                }
            }
        }
        console.log("Arquivos antigos deletados com sucesso.");
    } catch (err) {
        console.error("Erro ao deletar arquivos antigos:", err);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("Preparando para salvar o arquivo...");
        cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = crypto.randomBytes(8).toString("hex");
        cb(null, `${Date.now()}${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use("/img", express.static(uploadDirectory));

ensureUploadDirectoryExists();

app.post("/upload", async (req, res) => {
    console.log("Recebido pedido de upload.");

    try {
        await deleteOldFiles(uploadDirectory);

        upload.array("images", 3)(req, res, async function (err) {
            if (err) {
                console.error("Erro no processo de upload:", err);
                return res.status(500).json({ message: "Erro no upload de arquivos." });
            }

            console.log("Arquivos recebidos:", req.files);
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ message: "Nenhum arquivo foi carregado." });
            }

            req.files.forEach(file => {
                console.log("Caminho completo da imagem salva:", file.path);
            });

            const isLocal = process.env.NODE_ENV !== "production";
            const scriptPath = path.join(__dirname, "api", "pre_load_stuff.py");

            function runPythonScript(commands) {
                const command = commands.shift();
                console.log(`Tentando executar o comando: ${command}`);

                exec(command, async (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Erro ao executar o comando ${command}: ${error.message}`);
                        if (commands.length > 0) {
                            runPythonScript(commands);
                        } else {
                            return res.status(500).json({
                                message: "Erro ao executar o script Python.",
                                error: error.message,
                                stderr: stderr
                            });
                        }
                    } else {
                        console.log(`Saída do comando ${command}: ${stdout}`);
                        if (stderr) {
                            console.warn(`Aviso no script Python com o comando ${command}: ${stderr}`);
                        }
                        try {
                            const jsonFilePath = path.join(__dirname, "api", "json", "classificados.json");
                            const data = await fs.readFile(jsonFilePath, "utf8");
                            return res.status(200).json(JSON.parse(data));
                        } catch (err) {
                            console.error("Erro ao ler o arquivo JSON:", err);
                            return res.status(500).json({
                                message: "Erro ao ler o arquivo JSON.",
                                error: err.message
                            });
                        }
                    }
                });
            }

            const commandsToTry = isLocal ? [`py "${scriptPath}"`, `python "${scriptPath}"`, `python3 "${scriptPath}"`] : [`python "${scriptPath}"`, `python3 "${scriptPath}"`];

            runPythonScript(commandsToTry);
        });
    } catch (err) {
        console.error("Erro durante o processo de upload:", err);
        res.status(500).json({
            message: "Erro durante o processo de upload.",
            error: err.message
        });
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.use((err, req, res, next) => {
    if (err) {
        console.error("Erro:", err);
        res.status(500).json({ message: "Erro no servidor.", error: err.message });
    } else {
        next();
    }
});
