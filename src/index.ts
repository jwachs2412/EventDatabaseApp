type EventType = { kind: "concert" } | { kind: "festival"; dateRange: [string, string] } | { kind: "sports" } | { kind: string; dateRange?: [string, string] }

// Shape of the Event Object
interface Event {
  id: number
  type: EventType
  name: string
  date?: string
  row?: number | string
  seat?: number | string
  notes?: string
}

// Event Database Array
const eventDatabase: Event[] = [
  { id: 0, type: { kind: "concert" }, name: "Chris Stapleton", date: "12/12/2018", row: 8, seat: 23, notes: "The concert was outstanding. 10/10" },
  { id: 1, type: { kind: "sports" }, name: "Cleveland Browns v Pittsburgh Steelers", date: "11/6/1998", notes: "The Browns won 23-14 and played outstanding. 10/10" },
  { id: 2, type: { kind: "concert" }, name: "Led Zepplin", date: "6/19/1974", row: "FF", seat: 2, notes: "The concert was outstanding. Led Zepplin blew the roof off! 10/10" },
  { id: 3, type: { kind: "festival", dateRange: ["7/12/2024", "7/14/2024"] }, name: "Bonnaroo" }
]

// AUTHOR SUGGESTION
// Capitalization Function
// function capitalize(word: string): string {
//   return word.charAt(0).toUpperCase() + word.slice(1)
// }

// Add an Event
function addEvent(obj: Event): Event[] {
  eventDatabase.push(obj)

  console.log(eventDatabase)
  return eventDatabase
}

// AUTHOR'S SOLUTION - more production ready - understand this before implementing
// function addEvent(obj: Omit<Event, "id">): Event[] {
//   const newId = eventDatabase.length > 0 ? eventDatabase[eventDatabase.length - 1].id + 1 : 1
//   eventDatabase.push({ id: newId, ...obj })
//   console.log(eventDatabase)
//   return eventDatabase
// }

addEvent({
  id: 4,
  type: { kind: "theater" },
  name: "Hamilton",
  date: "9/8/2023",
  notes: "Incredible show, worth every penny!"
})

// Pretty Prints the Event Database, showing the Date Range
console.log(JSON.stringify(eventDatabase, null, 2))

// List All Events
function listEvents(events: Event[]) {
  console.log("\nList of All Events You Have Attended:\n")
  for (const currentEvent of events) {
    console.log(`Event Type: ${currentEvent.type.kind.charAt(0).toUpperCase() + currentEvent.type.kind.slice(1)}\nEvent: ${currentEvent.name.charAt(0).toUpperCase() + currentEvent.name.slice(1)}\nDate(s): ${currentEvent.date}${currentEvent.seat ? `\nSeat: ${currentEvent.seat}` : ""}${currentEvent.row ? `\nRow: ${currentEvent.row}` : ""}${currentEvent.notes ? `\nEvent Notes: ${currentEvent.notes}` : ""}\n`)
  }
}

listEvents(eventDatabase)

// Get Event Summary
function getEventSummary(events: Event[]): void {
  if (events.length === 0) {
    console.log("There are no events...")
    return
  }

  const totalEvents = events.length
  // Show total number of events attended
  console.log(`Total Events: ${totalEvents}`)

  const eventTypes = events.map(event => event.type)
  const counts: { [key: string]: number } = {}
  for (const event of eventTypes) {
    if (!event.kind) continue
    counts[event.kind] = (counts[event.kind] ?? 0) + 1
  }
  const eventsAttended = Object.keys(counts).map(key => {
    return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${counts[key]}`
  })
  const eventsAttendedSummary = eventsAttended.join(" | ")
  // Show Summary of Events
  console.log(eventsAttendedSummary)

  const eventNotes = events.filter(event => event.notes)
  const notesCount = eventNotes.length
  // Show Number of Events That Contain Notes
  console.log(`Events with notes: ${notesCount}`)
}

getEventSummary(eventDatabase)

// View Events by Type
function viewEventType(events: Event[], kind: string): void {
  if (events.length === 0) {
    console.log(`No events found.`)
    return
  }

  const eventTypes = events.map(event => event.type.kind)

  if (eventTypes.includes(kind)) {
    const eventType = events.filter(event => event.type.kind.toLowerCase() === kind.toLowerCase())
    console.log(`\nFiltering by "${kind}"...`)
    if (kind === "concert") {
      const evenEmoji = "🎵"
      const oddEmoji = "🎸"
      eventType.map((event, index) => {
        const eventEmoji = index % 2 === 0 ? evenEmoji : oddEmoji
        console.log(`${eventEmoji} ${event.name} -- ${event.date}`)
      })
    } else if (kind === "sports") {
      const evenEmoji = "💪"
      const oddEmoji = "🎽"
      eventType.map((event, index) => {
        const eventEmoji = index % 2 === 0 ? evenEmoji : oddEmoji
        console.log(`${eventEmoji} ${event.name} -- ${event.date}`)
      })
    } else if (kind === "festival") {
      const evenEmoji = "🎶✨"
      const oddEmoji = "🎤🎉"
      eventType.map((event, index) => {
        const eventEmoji = index % 2 === 0 ? evenEmoji : oddEmoji
        if (event.type.kind === "festival" && event.type.dateRange) {
          const [startDate, endDate] = event.type.dateRange
          console.log(`${eventEmoji} ${event.name} -- ${startDate} - ${endDate}`)
        } else {
          console.log(`${eventEmoji} ${event.name} -- ${event.date}`)
        }
      })
    } else {
      eventType.map(event => {
        console.log(`${event.name} -- ${event.date}`)
      })
    }
  } else {
    console.log(`\nEvent type "${kind}" does not exist.`)
  }
  // AUTHOR'S SUGGESTION
  //   for (const e of eventType) {
  //     console.log(`${e.name} — ${e.date}`)
  //   }
}
viewEventType(eventDatabase, "concert")
viewEventType(eventDatabase, "sports")
viewEventType(eventDatabase, "festival")
viewEventType(eventDatabase, "theater")
viewEventType(eventDatabase, "technology")

// Get Event by ID
function getEventById(eventId: number): Event | undefined {
  return eventDatabase.find(event => event.id === eventId)
}

// AUTHOR'S SOLUTION - this will make it slightly more user-friendly
// function getEventById(eventId: number): Event | undefined {
//   const foundEvent = eventDatabase.find(event => event.id === eventId)
//   if (!foundEvent) {
//     console.log(`❌ No event found with ID: ${eventId}`)
//   } else {
//     console.log(`✅ Found event: ${foundEvent.name}`)
//   }
//   return foundEvent
// }
console.log(`\nHere is the event you wanted to view by ID:`)
console.log(getEventById(3))

// View Single Event
function viewEvent(id: number): void {
  const singleEvent = getEventById(id)

  if (singleEvent) {
    console.log("\nHere is the event you were looking for:\n")
    console.log(`Event Type: ${singleEvent.type.kind.charAt(0).toUpperCase() + singleEvent.type.kind.slice(1)}\nEvent: ${singleEvent.name.charAt(0).toUpperCase() + singleEvent.name.slice(1)}\nDate(s): ${singleEvent.date}\nSeat: ${singleEvent.seat ? singleEvent.seat : "N/A"}\nRow: ${singleEvent.row ? singleEvent.row : "N/A"}\nEvent Notes: ${singleEvent.notes ? singleEvent.notes : "N/A"}\n`)
  } else {
    console.log(`❌ No event found with ID: ${id}\n`)
  }
}

// AUTHOR SUGGESTION - uses nullish coalescing for the ternaries and also uses the capitalize function
// function viewEvent(id: number): void {
//   const singleEvent = getEventById(id)

//   if (singleEvent) {
//     console.log("\nHere is the event you were looking for:\n")
//     console.log(
//       `Event Type: ${capitalize(singleEvent.type)}\n` +
//       `Event: ${capitalize(singleEvent.name)}\n` +
//       `Date(s): ${singleEvent.date}\n` +
//       `Seat: ${singleEvent.seat ?? "N/A"}\n` +
//       `Row: ${singleEvent.row ?? "N/A"}\n` +
//       `Event Notes: ${singleEvent.notes ?? "N/A"}\n`
//     )
//   } else {
//     console.log(`❌ No event found with ID: ${id}\n`)
//   }
// }

viewEvent(2)

// Edit Single Event - keeping Partial in there as a helper - makes all Event props optional for update - refactor below function at some point, removing the if statements and replacing with less code
function editEvent(id: number, updates: Partial<Event>): void {
  const eventToEdit = getEventById(id)

  if (!eventToEdit) {
    console.log(`Event id: ${id} could not be located.`)
  }

  if (eventToEdit) {
    if (updates.type) {
      eventToEdit.type = updates.type
    }

    if (updates.name) {
      eventToEdit.name = updates.name
    }

    if (updates.date) {
      eventToEdit.date = updates.date
    }

    if (updates.row) {
      eventToEdit.row = updates.row
    }

    if (updates.seat) {
      eventToEdit.seat = updates.seat
    }

    if (updates.notes) {
      eventToEdit.notes = updates.notes
    }

    console.log(`Event id: ${id} has been updated. Here is the updated event database: \n`)
    console.log(JSON.stringify(eventDatabase, null, 2))
  } else {
    console.log(`Event id: ${id} was not found.`)
  }
}

editEvent(1, { notes: "Amazing live performance!", seat: 12 })

// Delete Event
function deleteEvent(id: number): void {
  const index = eventDatabase.findIndex(event => event.id === id)

  if (index >= 0) {
    const eventRemoved = eventDatabase.splice(index, 1)[0]
    if (eventRemoved) {
      console.log(`\nEvent "${eventRemoved.name}" (ID: ${eventRemoved.id}) deleted successfully.`)
      console.log(JSON.stringify(eventDatabase, null, 2))
    }
  } else {
    console.log(`\nEvent not found.`)
  }
}

deleteEvent(2)
deleteEvent(10)
