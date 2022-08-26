const mongoose = require('mongoose')
// here we define the SCHEMA for the BJJ classes or "sessions" (to avoid using typical programming words)
// sessions are unlimited, it's every instance that a teacher holds a BJJ class

const sessionSchema = mongoose.Schema(
    {
        // date/time the session was held
        when: {
            type: Object,
            required: [true, 'Date "when" required.'],
            properties: {
                // day held
                date: {
                    type: Date,
                    required: [true, 'Date required.'],
                },
                // slot in the schedule -> pre-decided time (e.g. 10:00AM)
                // duration of the session in minutes
                time: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Schedule'
                },
            }
        },
        who: {
            type: Object,
            required: [true, 'Attendance "who" required.'],
            properties: {
                teacher: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: [true, 'Teacher required.'],
                    ref: 'Human'
                },
                students: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: [true, 'Students required.'],
                    ref: 'Human'
                },
            }
        },
        // type of session: focus, allLevels, advanced, etc.
        // array of techniques
        // gi or nogi
        curriculum: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Curriculum',
        },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Session', sessionSchema)