<template>
    <!-- CALENDAR -->
    <div class="p-5 bg-light-grey rounded-md shadow-lg flex flex-col mb-4 justify-center">
      <div class="rounded-md bg-at-light-orange mb-2 self-center">
        <span class="flex text-m text-white px-20">Sessions</span>
      </div>
      <div class="">
      <!-- Skeleton loader (no data) -->
      <v-calendar
        class="animate-pulse"
        is-expanded
        v-if="skeleton"
      />
      <!-- Actual calendar with data -->
      <v-calendar
        is-expanded
        :attributes="attributes"
        @dayclick = 'daySelected'
        v-if="calendar"
      >

      </v-calendar>

    <!-- SESSION CARD -->
    <div class="p-5 bg-light-grey rounded-md flex flex-col justify-center" v-if="displaySessionCard">
      <div class="rounded-md bg-at-light-orange mb-2 self-center">
        <span class="flex text-m text-white px-24">{{ sessionCardDate }}</span>
      </div>

      <div class="pl-4 px-6 py-6 animate-pulse" v-if="sessionCardSkeleton">
            <span class="list-inside space-y-1 justify-center">
              Loading session data
            </span>
      </div>
      <div class="pl-4 px-6">
            <ul class="list-inside space-y-1 justify-center" v-if="afterSessionCardSkeleton">
                <li class="text-l text-dark-grey uppercase">{{ attendedOrNot }}</li>
                <li class="text-l text-dark-grey uppercase">{{ sessionTopic }}</li>
                <div class="flex flex-col mb-2">
                    <label for="techniqueList" class="mb-1 text-at-light-orange"
                    >Techniques</label
                    >
                    <ul id="techniqueList">
                        <li v-for="(item, index) of techniqueList" :key="index">
                            - {{ item }}
                        </li>
                    </ul>
                </div>
            </ul>
      </div>
    </div>

    <div class="p-5 bg-light-grey rounded-md flex flex-col justify-center" v-if="noSessionCard">
      <span class="flex justify-center">No session on this date</span>
    </div>

      </div>
    </div>
</template>

<script>
import { ref, reactive } from "vue";
import store from "../store/store"
import { getAllFocusLessons } from "../services/bjj_services/focusLessonService"
import { createTechnique, getAllTechniques, getTechnique } from "../services/bjj_services/techniqueService";
import { createPosition, getAllPositions, getPosition } from "../services/bjj_services/positionService";
import { createMove, getAllMoves, getMove } from "../services/bjj_services/moveService";
import { createVariation, getAllVariations, getVariation } from "../services/bjj_services/variationService";

export default {
  name: "SessionCalendar",
  setup() {
    // Variables
    const errorMsg = ref(null);
    const delay = 3500  // ms delay to sync the skeletonService and displayStudentData setTimeouts
    const selectedDay = ref(null)
    const dayDescription = ref(null)
    const displaySessionCard = ref(null) // if true, displays selected session's data
    const noSessionCard = ref(null) // if true, displays "no session data"
    const sessionCardDate = ref(null)
    const selectedLesson = ref(null)
    const sessionTopic = ref(null)
    

    // Training data
    const studentTrainingData = ref(null)
    const unattendedSessions = ref(null)
    const attendedSessions = ref(null)
    const techniqueList = reactive([])
    const attendedOrNot = ref(null)

    const getTopic = async(focusLessonId) => { // returns string
      const allFocusLessons = await getAllFocusLessons()
      return await allFocusLessons.filter(_id => JSON.stringify(_id).includes(focusLessonId))[0].topic
    }

    // Skeleton vars
    const skeleton = ref(null)
    const calendar = ref(null)
    const sessionCardSkeleton = ref(null)
    const afterSessionCardSkeleton = ref(null)
    
    const skeletonService = _ => {
      skeleton.value = true
      calendar.value = false
      sessionCardSkeleton.value = true
      afterSessionCardSkeleton.value = false

      setTimeout(() => {
        skeleton.value = false
        calendar.value = true
        sessionCardSkeleton.value = false
        afterSessionCardSkeleton.value = true
      }, delay);
    }
    skeletonService()

    // **************  CALENDAR ************** 
    const date = ref(null)
    const attributes = ref(null)

    setTimeout(() => {
      studentTrainingData.value = store.methods.getStudent().training
      unattendedSessions.value = studentTrainingData.value.unattendedSessions
      attendedSessions.value = studentTrainingData.value.attendedSessions

      // Returns array of promises (attended sessions)
      const attendedPromise = attendedSessions.value.map(async aS => ({
        highlight: {
          style: {
            backgroundColor: '#E7C93B',
            borderColor: '#E7C93B'
          },
          fillMode: 'outline'
        },
        popover: {
          label: `${await getTopic(aS.what.focus._id)}`,
        },
        dates: aS.when.date
      }))

      // Returns array of promises (unattended sessions)
      const unattendedPromise = unattendedSessions.value.map(async uS => ({
        highlight: {
          style: {
            backgroundColor: 'rgba(231, 201, 59, .3)',
            borderColor: 'rgba(231, 201, 59, 0)'
          },
          fillMode: 'outline'
        },
        popover: {
          label: `${await getTopic(uS.what.focus._id)}`,
        },
        dates: uS.when.date
      }))

      const todayMarker = [{ // Style for a marker that marks today's date
          key: 'today',
          dot: 'yellow',
          dates: new Date(),
        }]

      // Returns resolved array of promises
      const resolvePromiseArrays = async(arr1, arr2) => {
        const res1 = await Promise.all(arr1)
        const res2 = await Promise.all(arr2)
        attributes.value = res1.concat(res2).concat(todayMarker)
      }
      resolvePromiseArrays(attendedPromise, unattendedPromise)
    }, delay);


    // DISPLAYS A DIV WITH SESSION DATA IF THE CLICKED DATE IS A FOCUS SESSION DATE
    const daySelected = day => {
      selectedDay.value = day.date.toISOString().slice(0, 10) // YYYY-MM-DD
      const trainingData = store.methods.getStudent().training
      const allSessions = trainingData.allSessions
      const attendedDates = trainingData.attendedSessions.map(s => s.when.date.slice(0, 10)) // YYYY-MM-DD

    const getFocusLessonTechniqueIDs = async(lessonID) => { // returns array of objects [ {id: 'string'}, ]
      const allFocusLessons = await getAllFocusLessons()
      const lessonTechniques = allFocusLessons.filter(_id => JSON.stringify(_id).includes(lessonID))[0].content.techniques // returns array of technique ids of a specific focus lesson
      return lessonTechniques
    }

    const getTechniqueObjectFromID = async(techniqueID) => {
      const getTechniqueObject = await getTechnique(techniqueID)
      return getTechniqueObject
    }

    const showSessionTechniques = async(lessonID) => {
        const sessionTechniques = await getFocusLessonTechniqueIDs(lessonID) // ************* PASSING AN ID MANUALLY
        const sessionTechniqueIDs = await Promise.all(sessionTechniques.map(e => e._id)) // returns array of string ids [ 'string', ]
        const sessionTechniqueObjects = await Promise.all(sessionTechniqueIDs.map(id => getTechniqueObjectFromID(id))) // returns array of technique objects [ {...}, ]

        for await (const technique of sessionTechniqueObjects) {
            await decryptTechnique(technique.position, technique.move, technique.variation)
        }
    }

    const decryptTechnique = async(positionId, moveId, variationId) => {
        // unintended outcome: pushes to array but selecting a different day pushes more to the array
        // intended: creates a new array each time
        const positionObject = await getPosition(positionId)
        const moveObject = await getMove(moveId)
        const variationObject = await getVariation(variationId)

        if(moveObject.category.pass === true) {
            techniqueList.push(`${variationObject.name.english} ${moveObject.name.english} Pass from ${positionObject.name.english}`)
        }

        if(moveObject.category.entry === true) {
           techniqueList.push(`${variationObject.name.english} Entry ${moveObject.name.english} from ${positionObject.name.english}`)
        }

        if(moveObject.category.escape === true) {
           techniqueList.push(`${variationObject.name.english} ${moveObject.name.english} Escape from ${positionObject.name.english}`)
        }

        if(moveObject.category.submission === true) {
           techniqueList.push(`${variationObject.name.english} ${moveObject.name.english} from ${positionObject.name.english}`)
        }

        if(moveObject.category.sweep === true) {
           techniqueList.push(`${variationObject.name.english} ${moveObject.name.english} Sweep from ${positionObject.name.english}`)
        }

        if(moveObject.category.takedown === true && positionObject.name.english === "Standing") {
            techniqueList.push(`${variationObject.name.english} ${moveObject.name.english} Takedown`)
        } else if (moveObject.category.takedown === true) {
            techniqueList.push(`${variationObject.name.english} ${moveObject.name.english} Takedown from ${positionObject.name.english}`)
        }
    }

      // Displays data related to the session that was held on the clicked day (if any)
      const displaySessionData = async() => {
        const sessionOnSelectedDay = allSessions.filter(s => s.when.date.includes(selectedDay.value))[0]
        const attendedOnSelectedDay = attendedDates.filter(d => d.includes(selectedDay.value))[0]
        const lessonOnSelectedDay = allSessions.filter(s => s.when.date.includes(selectedDay.value))[0]

        

        if (sessionOnSelectedDay) {
          techniqueList.splice(0, techniqueList.length) // deletes all values so the array shows only the selected date
          selectedLesson.value = lessonOnSelectedDay.what.focus._id
          showSessionTechniques(selectedLesson.value)
          sessionTopic.value = await Promise.resolve(getTopic(lessonOnSelectedDay.what.focus._id))
          console.log(lessonOnSelectedDay)
          displaySessionCard.value = true
          noSessionCard.value = false
        }
        if (!sessionOnSelectedDay) {
          displaySessionCard.value = false
          noSessionCard.value = true
        }
        attendedOnSelectedDay ? attendedOrNot.value = 'Attended' : attendedOrNot.value = 'Not Attended'
      }
        sessionCardDate.value = selectedDay.value
        displaySessionData()
    }


    return {
        errorMsg, date, attributes,
        // Skeleton
        skeleton, calendar, sessionCardSkeleton, afterSessionCardSkeleton,
        dayDescription,
        // Session Card
        daySelected, selectedDay,
        displaySessionCard, sessionCardDate, noSessionCard,
        // Training data
        studentTrainingData, attendedSessions, unattendedSessions, techniqueList, selectedLesson, attendedOrNot, sessionTopic
    };
  },
};
</script>
