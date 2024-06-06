const express = require('express');
const mysql = require("mysql");
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = express();
const { Op } = require('sequelize');

const PORT = 3001; 
app.use(cors());
app.use(express.json());
const secret = "0";

// Importe o modelo Usuario
const Usuario = require("./models/Usuario.js");
const Contribuinte = require("./models/Contribuinte.js");
const Imposto = require("./models/Imposto.js");

const conexão = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bdsistema'
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

const server = http.createServer((req, res) => {
    // Parse URL
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html'; // Se a URL for '/', carregue index.html
    }

    // Determine o tipo de conteúdo com base na extensão do arquivo
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
    }[extname] || 'application/octet-stream';

    // Verifique se o arquivo existe
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Arquivo não encontrado
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                // Outro erro
                res.writeHead(500);
                res.end(`500 Internal Server Error: ${err.code}`);
            }
        } else {
            // Arquivo encontrado, envie-o para o cliente
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});


async function verificaTabelas() {
    try {
        // Verifica se a tabela Usuario já existe no banco de dados
        const tabelaUsuarioExiste = await Usuario.sync({ force: false });
        
        // Se a tabela Usuario não existir, recrie-a
        if (!tabelaUsuarioExiste) {
            await Usuario.sync({ force: true });
            console.log('Tabela "Usuario" criada com sucesso.');
        } else {
            console.log('A tabela "Usuario" já existe. Não é necessário recriá-la.');
        }

        // Verifica se a tabela Contribuinte já existe no banco de dados
        const tabelaContribuinteExiste = await Contribuinte.sync({ force: false });
        
        // Se a tabela Contribuinte não existir, recrie-a
        if (!tabelaContribuinteExiste) {
            await Contribuinte.sync({ force: true });
            console.log('Tabela "Contribuinte" criada com sucesso.');
        } else {
            console.log('A tabela "Contribuinte" já existe. Não é necessário recriá-la.');
        }

        const tabelaImpostoExiste = await Imposto.sync({ force: false });
        
          // Se a tabela Contribuinte não existir, recrie-a
          if (!tabelaImpostoExiste) {
            await Imposto.sync({ force: true });
            console.log('Tabela "Imposto" criada com sucesso.');
        } else {
            console.log('A tabela "Imposto" já existe. Não é necessário recriá-la.');
        }

    } catch (error) {
        console.error('Erro ao verificar ou criar tabelas:', error);
    }
}




conexão.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
      return;
    }
    console.log('Conexão bem-sucedida com o banco de dados MySQL');
    verificaTabelas();
});


app.post("/Cadastrar", async function(req, res){
    const {email,senha} = req.body;
  
    if (!email|| !senha ) {
      return res.status(400).json({ msg: 'Preencha todos os Campos!' });
    }
  
    try{
  
      const usuario = await Usuario.findOne({ where: { Email: email } });
  
    if (usuario) {
      return res.status(422).json({ msg: 'E-mail já está em uso por outro usuário!' });
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(senha, salt);
  
      
     const newUser = await Usuario.create({
      Email: email,
      senha: hash
    });
  
  res.status(201).json({ msg: "Usuário criado com sucesso!", user: newUser });


  } catch (error){

    res.status(500).json({ msg: "Erro ao realizar Cadastro", error: error.message });

  }

});


app.post("/Entrar", async function(req, res) {
    const { email, senha } = req.body;
  
    if (!email || !senha) {
      return res.status(400).json({ msg: 'Preencha email e senha¹' });
    }
  
    try {
      const user = await Usuario.findOne({ where: { Email: email } });
  
      if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado!' });
      }
  
      const checkPassword = await bcrypt.compare(senha, user.senha);
  
      if (!checkPassword) {
        return res.status(422).json({ msg: 'Senha inválida!' });
      }
  
      const token = jwt.sign({ id: user.id, Email: user.Email }, secret);
  
      return res.status(200).json({ msg: 'Autenticação bem-sucedida', token });
    } catch (error) {
      console.error('Erro:', error); // Log do erro específico
      return res.status(500).json({ msg: 'Ocorreu um erro ao autenticar o usuário' });
    }
  });



  app.post("/SalvarContribuinte", async function(req, res) {
    try {
        // Criar um novo objeto Contribuinte com os dados fornecidos no corpo da solicitação
        const novoContribuinte = await Contribuinte.create({
            Nome: req.body.nomeCompleto,
            Celular: req.body.celular,
            Email: req.body.email,
            DataNascimento: req.body.dataNascimento,
            Rua: req.body.rua,
            Numero: req.body.numero,
            Cidade: req.body.cidade,
            CPF: req.body.cpf,
            SenhaGov: req.body.senhaGov,
            NivelSenhaGov: req.body.nivelSenhaGov,
            
        });

        res.status(201).json({ message: "Contribuinte criado com sucesso", contribuinte: novoContribuinte });
    } catch (error) {
        console.error("Erro ao criar novo contribuinte:", error);
        res.status(500).json({ error: "Erro ao criar novo contribuinte" });
    }
});

app.post("/SalvarImposto", async function(req, res) {

    try {

        // Criar um novo objeto Contribuinte com os dados fornecidos no corpo da solicitação
        const novoImposto = await Imposto.create({
            Status: req.body.estado,
            ValorReceber: req.body.valorReceber,
            ValorPago: req.body.valorPago,
            AnoImposto: req.body.anoImposto,
            Observacao: req.body.observacao,
            ContribuinteId: req.body.contribuinteId,
        });

        res.status(201).json({ message: "Imposto criado com sucesso", imposto: novoImposto });
    } catch (error) {
        console.error("Erro ao criar novo Imposto:", error);
        res.status(500).json({ error: "Erro ao criar novo Imposto" });
    }
});


app.get("/ListarContribuintes/", async (req, res) => {
    try {
        const contribuintes = await Contribuinte.findAll({});

        res.status(200).json({ contribuintes });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar contribuintes", message: error.message });
    }
});

app.delete('/ExcluirContribuinte/:id', async (req, res) => {
    try {
        // Obtenha o ID do contribuinte da solicitação
        const contribuinteId = req.params.id;

        // Busque o contribuinte pelo ID
        const contribuinte = await Contribuinte.findByPk(contribuinteId);

        if (!contribuinte) {
            return res.status(404).json({ error: 'Contribuinte não encontrado' });
        }

        // Exclua o contribuinte
        await contribuinte.destroy();

        res.status(200).json({ message: 'Contribuinte excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir contribuinte:', error);
        res.status(500).json({ error: 'Erro ao processar a solicitação' });
    }
});

app.get('/ObterContribuinte/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Obtenha o ID do usuário da solicitação

        // Busque o usuário pelo ID
        const contribuinte = await Contribuinte.findByPk(userId);

        if (!contribuinte) {
            return res.status(404).json({ error: 'Contribuinte não encontrado' });
        }

        // Se o usuário for encontrado, retorne os dados do usuário
        res.status(200).json({ contribuinte });
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        res.status(500).json({ error: 'Erro ao processar a solicitação' });
    }
});

app.get('/ObterImposto/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Obtenha o ID do usuário da solicitação

        // Busque o usuário pelo ID
        const imposto = await Imposto.findByPk(userId);

        if (!imposto) {
            return res.status(404).json({ error: 'imposto não encontrado' });
        }

        // Se o usuário for encontrado, retorne os dados do usuário
        res.status(200).json({ imposto });
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        res.status(500).json({ error: 'Erro ao processar a solicitação' });
    }
});
app.put('/AtualizarContribuinte/:id', async (req, res) => {
    const id = req.params.id;
    const {
        Nome,
        Celular,
        Email,
        DataNascimento,
        Rua,
        Numero,
        Cidade,
        CPF,
        SenhaGov,
        NivelSenhaGov
    } = req.body;

    try {
        // Procurar o contribuinte pelo ID
        const contribuinte = await Contribuinte.findByPk(id);

        // Verificar se o contribuinte foi encontrado
        if (!contribuinte) {
            return res.status(404).json({ error: 'Contribuinte não encontrado.' });
        }

        // Atualizar os campos do contribuinte
        contribuinte.Nome = Nome;
        contribuinte.Celular = Celular;
        contribuinte.Email = Email;
        contribuinte.DataNascimento = DataNascimento;
        contribuinte.Rua = Rua;
        contribuinte.Numero = Numero;
        contribuinte.Cidade = Cidade;
        contribuinte.CPF = CPF;
        contribuinte.SenhaGov = SenhaGov;
        contribuinte.NivelSenhaGov = NivelSenhaGov;


        // Salvar as alterações no banco de dados
        await contribuinte.save();

        // Responder com sucesso
        res.status(200).json({ message: 'Registro atualizado com sucesso.', contribuinte });
    } catch (error) {
        console.error('Erro ao atualizar registro:', error);
        res.status(500).json({ error: 'Erro ao atualizar registro. Verifique o console para mais detalhes.' });
    }
});


app.put('/AtualizarImposto/:id', async (req, res) => {
    const id = req.params.id;
    const {
        Status,
        ValorReceber,
        ValorPago,
        AnoImposto,
        Observacao
    } = req.body;

    try {
        // Procurar o contribuinte pelo ID
        const imposto = await Imposto.findByPk(id);

        // Verificar se o contribuinte foi encontrado
        if (!imposto) {
            return res.status(404).json({ error: 'imposto não encontrado.' });
        }

        // Atualizar os campos do contribuinte

        imposto.Status = Status;
        imposto.ValorReceber = ValorReceber;
        imposto.ValorPago = ValorPago;
        imposto.AnoImposto = AnoImposto;
        imposto.Observacao = Observacao;
        imposto.contribuinteId = id;

        // Salvar as alterações no banco de dados
        await imposto.save();

        // Responder com sucesso
        res.status(200).json({ message: 'Registro atualizado com sucesso.', imposto });
    } catch (error) {
        console.error('Erro ao atualizar registro:', error);
        res.status(500).json({ error: 'Erro ao atualizar registro. Verifique o console para mais detalhes.' });
    }
});

app.delete('/ExcluirUsuario/:id', async (req, res) => {
    try {
        // Obtenha o ID do contribuinte da solicitação
        const usuarioId = req.params.id;

        // Busque o contribuinte pelo ID
        const usuario = await Usuario.findByPk(usuarioId);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario não encontrado' });
        }

        // Exclua o contribuinte
        await usuario.destroy();

        res.status(200).json({ message: 'usuario excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir usuario:', error);
        res.status(500).json({ error: 'Erro ao processar a solicitação' });
    }
});

app.get("/ListarUsuarios/", async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({});

        res.status(200).json({ usuarios });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar usuarios", message: error.message });
    }
});

app.get("/ObterNomeContribuinte/:id",async function (req,res){
    const userId = req.params.id;
    try {

    const contribuinte = await Contribuinte.findByPk(userId, {
        attributes: ['nome'] // Seleciona apenas o atributo 'nome' do contribuinte
    });
    
    if (!contribuinte) {
        return res.status(404).json({ error: 'contribuinte não encontrado' });
    }
    res.status(200).json({ contribuinte });

} catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ error: 'Erro ao processar a solicitação' });
}
})
app.get('/ListarImpostos/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Obtenha o ID do usuário da solicitação

        // Busque o usuário pelo ID
        const impostosDoUsuario = await Imposto.findAll({
            include: [{
                model: Contribuinte,
                where: { id: userId }
            }]
        });
        
        const contribuinte = await Contribuinte.findByPk(userId, {
            attributes: ['nome'] // Seleciona apenas o atributo 'nome' do contribuinte
        });
             if (!impostosDoUsuario) {
            return res.status(404).json({ error: 'Imposto não encontrado' });
        }

        // Se o usuário for encontrado, retorne os dados do usuário
        res.status(200).json({ impostosDoUsuario,contribuinte });
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        res.status(500).json({ error: 'Erro ao processar a solicitação' });
    }
});

app.delete('/ExcluirImposto/:id', async (req, res) => {
    try {
        // Obtenha o ID do contribuinte da solicitação
        const impostoid = req.params.id;

        // Busque o contribuinte pelo ID
        const imposto = await Imposto.findByPk(impostoid);

        if (!imposto) {
            return res.status(404).json({ error: 'imposto não encontrado' });
        }

        // Exclua o contribuinte
        await imposto.destroy();

        res.status(200).json({ message: 'imposto excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir imposto:', error);
        res.status(500).json({ error: 'Erro ao processar a solicitação' });
    }
});

app.get("/ContasReceber", async function (req,res){
    try{

        const impostos = await Imposto.findAll({
            where: {
                ValorReceber: {
                    [Op.gt]: 0 // Filtrar onde ValorReceber é diferente de 0
                }
            }, include: {
                model: Contribuinte,
                attributes: ["Nome","Celular"],
            }
        });

        if(!impostos){
            return res.status(404).json({ error: 'imposto não encontrado' });
        }
        res.status(200).json({ impostos });

    }catch(error){
        res.status(500).json({ error: 'Erro ao processar a solicitação' });

    }
})

app.get("/ContasPagas", async function (req,res){
    try{

        const impostos = await Imposto.findAll({
            where: {
                ValorReceber: 0
            }, include: {
                model: Contribuinte,
                attributes: ["Nome","Celular"],
            }
        });

        if(!impostos){
            return res.status(404).json({ error: 'imposto não encontrado' });
        }
        res.status(200).json({ impostos });

    }catch(error){
        res.status(500).json({ error: 'Erro ao processar a solicitação' });

    }
})