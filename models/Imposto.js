const { DataTypes, Sequelize } = require('sequelize');
const Contribuinte = require('./Contribuinte');
const sequel = new Sequelize('bdsistema','root','',{
    host:"localhost", 
    dialect:'mysql'
})

const Imposto = sequel.define('Impostos', {
    Observacao:{
        type: DataTypes.STRING,
        allowNull: true
      },  
      Status:{
        type: DataTypes.STRING,
        allowNull: false
      },
      ValorReceber:{
        type: DataTypes.FLOAT,
        allowNull: false
      },
      ValorPago:{
        type: DataTypes.FLOAT,
        allowNull: false
      },
      AnoImposto:{
        type: DataTypes.INTEGER,
        allowNull: false
      }
    });
    Imposto.belongsTo(Contribuinte);    
    module.exports = Imposto;