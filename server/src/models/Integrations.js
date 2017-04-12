'use strict'

const mongoose = require('mongoose')

var schema = mongoose.Schema({
  name: { type: String, unique: true, required: true, dropDups: true },
  displayName: String,
  rootUrl: String,
  auth: Object,
  actions: Object,
  remote: Object
})

schema.statics.getAll = cb => Model.find().exec(cb)
schema.statics.getOne = (name, cb) => Model.findOne({ name: name }).exec(cb)
schema.statics.getOneBy = (condition, cb) => Model.findOne(condition).exec(cb)
schema.statics.removeOne = (name, cb) => Model.findOneAndRemove({ name: name }).exec(cb)

const Model = mongoose.model('Integrations', schema)
module.exports = Model
