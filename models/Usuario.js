const { DataTypes, Sequelize } = require('sequelize');
const sequel = new Sequelize('bdsistema','root','',{
    host:"localhost", 
    dialect:'mysql'
})

const Usuario = sequel.define('Usuarios', {
    Email: {
    type: DataTypes.STRING,
    allowNull: false
  },

  senha: {
    type: DataTypes.STRING,
    allowNull: false
  },

});


module.exports = Usuario;