const mongoose = require('mongoose');

const applianceSchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  price: Number,
  image: String
})

module.exports = mongoose.model('Appliance', applianceSchema)