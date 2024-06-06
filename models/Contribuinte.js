const { DataTypes, Sequelize } = require('sequelize');
const sequel = new Sequelize('bdsistema','root','',{
    host:"localhost", 
    dialect:'mysql'
})

const Contribuinte = sequel.define('Contribuintes', {
    Nome: {
    type: DataTypes.STRING,
    allowNull: false
  },

  Celular: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  DataNascimento:{
    type: DataTypes.DATE,
    allowNull: false
  },
  Rua:{
    type: DataTypes.STRING,
    allowNull: false
  },
  Numero:{
    type: DataTypes.STRING,
    allowNull: false
  },
  Cidade:{
    type: DataTypes.STRING,
    allowNull: false    
  },

  CPF:{
    type: DataTypes.STRING,
    allowNull: false
  }, 
  SenhaGov:{
    type: DataTypes.STRING,
    allowNull: false
  },
  NivelSenhaGov:{
    type: DataTypes.STRING,
    allowNull: false
  },
 
});

module.exports = Contribuinte;