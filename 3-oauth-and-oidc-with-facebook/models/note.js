
const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const NoteSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    priority: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
{
    timestamps: true
})

const NoteModel = mongoose.model("Note", NoteSchema)

module.exports = NoteModel