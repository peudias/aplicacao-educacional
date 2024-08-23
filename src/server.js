const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs").promises;
const { exec } = require("child_process");

// Diretório onde as imagens serão carregadas
const uploadDirectory = path.join(__dirname, "api", "img");

// Função para deletar arquivos antigos
async function deleteOldFiles(directory) {
    try {
        const files = await fs.readdir(directory);
        for (const file of files) {
            const filePath = path.join(directory, file);
            await fs.unlink(filePath);
        }
    } catch (err) {
        console.error("Erro ao deletar arquivos antigos:", err);
    }
}

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        await deleteOldFiles(uploadDirectory);
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
app.use("/src/api/img", express.static(path.join(__dirname, "api", "img")));

app.post("/upload", upload.array("images", 3), async (req, res) => {
    console.log("Arquivos recebidos:", req.files);
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Nenhum arquivo foi carregado." });
    }

    // Verifica o diretório de trabalho e variáveis de ambiente
    console.log("Diretório de trabalho:", process.cwd());
    console.log("Variáveis de ambiente:", JSON.stringify(process.env, null, 2));

    // Corrige o caminho do script Python
    const pythonScriptPath = path.normalize(path.resolve(__dirname, "..", "src", "api", "pre_load_stuff.py"));
    const pythonCommand = `py "${pythonScriptPath}"`;

    console.log("Comando Python:", pythonCommand);

    exec(pythonCommand, async (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro ao executar o script Python: ${error.message}`);
            console.error(`Saída do stderr: ${stderr}`);
            return res.status(500).json({ message: "Erro ao executar o script Python." });
        }
        console.log(`Saída do stdout: ${stdout}`);
        if (stderr) {
            console.error(`Saída do stderr: ${stderr}`);
        }

        try {
            const jsonFilePath = path.join(__dirname, "api", "json", "classificados.json");

            const data = await fs.readFile(jsonFilePath, "utf8");

            res.status(200).json(JSON.parse(data));
        } catch (err) {
            console.error("Erro ao ler o arquivo JSON:", err);
            res.status(500).json({ message: "Erro ao ler o arquivo JSON." });
        }
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
