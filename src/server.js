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

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("Preparando para salvar o arquivo...");
        // Garantindo que o diretório de upload é correto
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
app.use("/src/api/img", express.static(uploadDirectory));

app.post("/upload", async (req, res) => {
    console.log("Recebido pedido de upload.");

    try {
        // Primeiro, deletar os arquivos antigos
        await deleteOldFiles(uploadDirectory);

        // Em seguida, processar o upload
        upload.array("images", 3)(req, res, async function (err) {
            if (err) {
                console.error("Erro no processo de upload:", err);
                return res.status(500).json({ message: "Erro no upload de arquivos." });
            }

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
                    return res.status(500).json({ message: "Erro ao executar o script Python." });
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
    } catch (err) {
        console.error("Erro durante o processo de upload:", err);
        res.status(500).json({ message: "Erro durante o processo de upload." });
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Middleware para lidar com erros
app.use((err, req, res, next) => {
    if (err) {
        console.error("Erro:", err);
        res.status(500).json({ message: "Erro no servidor." });
    } else {
        next();
    }
});
