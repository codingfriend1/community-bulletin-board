'use strict';

// article-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
  url: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: false },
  tags: { type: Array, required: false },
  votes: { type: Number, required: false, default: 0 },
  createdBy: { type: String, required: true},
  createdByEmail: { type: String, required: true},
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
});

const articleModel = mongoose.model('article', articleSchema);

module.exports = articleModel;
