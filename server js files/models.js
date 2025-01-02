const { type } = require('jquery')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
     type: String,
     requiered: true,
     unique: true
    },
    email: {
     type: String,
     requiered: true,
     unique: true
    },
    password: {
     type: String,
     requiered: true,
     unique: true
    },
    profilePicture: {
      data: {
          type: Buffer,
          default:'No Image' // Default binary image data
      },
      contentType: {
          type: String,
          default: 'No Image' // Default MIME type
      }
  },
   isActive: {
    type: 'boolean',
    default: false
   }
  }, { timestamps: true })//end of user schema

  
const groupSchema = new mongoose.Schema({
    groupName: {
      type: String,
      requiered: true,
      unique: true
    },
    numberOfmembers: {
      type: Number,
      default: 0
    }
  }, { timestamps: true })//end of group schema


const User = mongoose.model('User', userSchema)
const Group = mongoose.model('Group', groupSchema)

  module.exports = { User, Group }