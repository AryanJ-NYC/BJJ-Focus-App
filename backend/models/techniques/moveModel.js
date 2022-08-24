const mongoose = require('mongoose')

const moveSchema = mongoose.Schema(
    {
        name: {
            type: Object,
            required: [true, 'Name required'],
            properties: {
                english: {
                    type: String,
                    required: false,
                },
                portuguese: {
                    type: String,
                    required: false,
                },
                japanese: {
                    type: Object,
                    required: false,
                    properties: {
                        kanji: {
                            type: String,
                            required: false,
                        },
                        hiraganaReading: {
                            type: String,
                            required: false,
                        },
                        romajiReading: {
                            type: String,
                            required: false,
                        },
                    }
                },

            },

        },
        type: {
            type: Object,
            required: [true, 'Type required'],
            properties: {
                pass: {
                    type: Boolean,
                    required: false,
                },
                escape: {
                    type: Boolean,
                    required: false,
                },
                control: {
                    type: Boolean,
                    required: false,
                },
                submission: {
                    type: Boolean,
                    required: false,
                },
            },
        }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Move', moveSchema)
