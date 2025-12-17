// TODO: Add persistent storage instead of in-memory DB
// TODO: Add validation for event input
// TODO: Add delete confirmation flow
// TODO: Add sorting and pagination

enum EventKind {
  Concert = "concert",
  Festival = "festival",
  Sports = "sports",
  Theater = "theater",
  Conference = "conference",
  Wedding = "wedding",
  Museum = "museum",
  Other = "other"
}

// Definitive behavior;
type EventType = { kind: EventKind.Concert } | { kind: EventKind.Festival; dateRange: [string, string] } | { kind: EventKind.Sports } | { kind: EventKind.Theater } | { kind: EventKind.Conference } | { kind: EventKind.Wedding } | { kind: EventKind.Museum } | { kind: EventKind.Other }

// Advantage is compiler catches the error
type Result<T> = { ok: true; data: T } | { ok: false; error: string }

// Shape of the Event Object
type AppEvent = {
  id: number
  type: EventType
  name: string
  date?: string
  row?: number | string
  seat?: number | string
  notes?: string
}

type NonFestivalUpdate = { dateRange?: never }
type FestivalUpdate = { dateRange: [string, string] }

// Allows for partial updates on EventType
type EventTypeUpdate = NonFestivalUpdate | FestivalUpdate

type NewEventInput = Omit<AppEvent, "id">

type EventFromDB = (typeof eventDatabase)[number]

// Event Database Array
let eventDatabase: AppEvent[] = [
  { id: 1, type: { kind: EventKind.Concert }, name: "Chris Stapleton", date: "12/12/2018", row: 8, seat: 23, notes: "The concert was outstanding. 10/10" },
  { id: 2, type: { kind: EventKind.Sports }, name: "Cleveland Browns v Pittsburgh Steelers", date: "11/6/1998", notes: "The Browns won 23-14 and played outstanding. 10/10" },
  { id: 3, type: { kind: EventKind.Concert }, name: "Led Zepplin", date: "6/19/1974", row: "FF", seat: 2, notes: "The concert was outstanding. Led Zepplin blew the roof off! 10/10" },
  { id: 4, type: { kind: EventKind.Festival, dateRange: ["7/12/2024", "7/14/2024"] }, name: "Bonnaroo" }
]

// Delay function
function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

// Sort events sortDirection: "asc" | "desc", container: HTMLElement | null
function sortEventsByKind(elementId: HTMLElement | null): Result<AppEvent[]> {
  const allEvents = eventDatabase

  if (allEvents.length === 0) {
    return { ok: false, error: `No events found` }
  }

  const dropdownOpts = [
    { value: "asc", text: "Ascending" },
    { value: "desc", text: "Descending" }
  ]

  const sortContainer = document.getElementById("sort-container")
  const dropdownContainer = document.getElementById("dropdown-container")

  if (!dropdownContainer || !sortContainer) {
    // throw new Error(`Container with ID "${elementId}" not found.`)
    return { ok: false, error: `Container with ID "${elementId}" not found.` }
  }

  // ---- CREATE SELECT ONCE ----
  const selectElement = document.createElement("select")
  selectElement.id = "direction-selector"
  selectElement.name = "direction"

  dropdownOpts.forEach(optionData => {
    const optionElement = document.createElement("option")
    optionElement.value = optionData.value
    optionElement.textContent = optionData.text
    selectElement.appendChild(optionElement)
  })

  dropdownContainer.appendChild(selectElement)

  // ---- RENDER HELPER ----
  function render(list: AppEvent[], title: string) {
    let html = `<h2>${title}</h2><ul>`
    list.forEach(event => {
      const kind = event.type.kind
      const date = kind === EventKind.Festival ? `${event.type.dateRange[0]} - ${event.type.dateRange[1]}` : event.date

      html += `<li>${kind} - ${event.name} - ${date}</li>`
    })
    html += "</ul>"
    sortContainer!.innerHTML = html
  }

  // ---- DEFAULT SORT (ASC) ----
  allEvents.sort((a, b) => a.type.kind.localeCompare(b.type.kind))
  render(allEvents, "Events List")

  // ---- EVENT LISTENER (THIS IS WHERE SORTING HAPPENS) ----
  selectElement.addEventListener("change", event => {
    const target = event.target as HTMLSelectElement
    const direction = target.value

    console.log("Selected direction:", direction)

    if (direction === "desc") {
      allEvents.sort((a, b) => b.type.kind.localeCompare(a.type.kind))
      render(allEvents, "Reversed Events List")
    } else {
      allEvents.sort((a, b) => a.type.kind.localeCompare(b.type.kind))
      render(allEvents, "Events List")
    }
  })

  return { ok: true, data: allEvents }
}

const sortContainer: HTMLElement | null = document.getElementById("sort-container")
sortEventsByKind(sortContainer)
// sortEventsByKind("desc", sortContainer)

// Show all events in database; combines async fetching with try/catch/finally - good because readability, error safety, reliable thanks to finally, easily maintainable
async function showEvents(): Promise<void> {
  console.log("Loading events...")

  const result = EventService.fetchEventsSafe()

  if (!result.ok) {
    console.log("Error: ", result.error)
    console.log("Finished attempting to load all events in the database.")
    return
  }

  console.log("Here are the list of events after a 1/2 second wait:")
  console.log(result.data)

  console.log("Finished attempting to load all events in the database.")
}

// Fetch events concurrently
async function fetchEventsConcurrently(ids: number[]): Promise<AppEvent[]> {
  const promises = ids.map(id => fetchEventByID(id))

  const results = await Promise.all(promises)

  // Custom Type Predicate - a function that acts as a user-defined type guard - parameterName is TypeName
  const events: AppEvent[] = results.filter((r): r is { ok: true; data: AppEvent } => r.ok).map(r => r.data)

  return events
}

fetchEventsConcurrently([1, 2, 3])
  .then(events => console.log("Fetched events concurrently: ", events))
  .catch(err => console.log("Error fetching events", err))

// Get All Events Safely; batch-fetch utility
async function getAllEventsSafe(ids: ReadonlyArray<number>): Promise<{ successes: AppEvent[]; failures: number[] }> {
  const promises = ids.map(id => fetchEventByID(id))
  const results = await Promise.all(promises)

  const successes: AppEvent[] = []
  const failures: number[] = []

  results.forEach((result, index) => {
    if (result.ok) {
      successes.push(result.data)
    } else if (ids[index] !== undefined) {
      failures.push(ids[index])
    }
  })

  return { successes, failures }
}

getAllEventsSafe([1, 2, 99]).then(console.log)

// Fetch event by ID - data layer
async function fetchEventByID(id: number): Promise<Result<AppEvent>> {
  await delay(300)
  //   return eventDatabase[id]
  const event = eventDatabase.find(event => event.id === id)
  if (!event) {
    return { ok: false, error: `No event found with ID: ${id}` }
  }
  return { ok: true, data: event }
}

fetchEventByID(999) // an ID that doesn't exist
  .then(result => {
    if (result.ok) {
      console.log("Resolved: ", result.data)
    } else {
      console.log("Recovered from rejection: ", result.error)
    }
  })

fetchEventByID(2) // an ID that does exist
  .then(result => {
    if (result.ok) {
      console.log("Resolved: ", result.data)
    } else {
      console.log("Recovered from rejection: ", result.error)
    }
  })

// Show event by ID - UI/Presentation layer
async function showSingleEvent(n: number): Promise<void> {
  console.log("Loading event...")
  try {
    const soloEvent = await fetchEventByID(n)
    console.log("Here is the event you requested: ")
    console.log(soloEvent)
  } catch (err) {
    throw err
  }
}
showSingleEvent(1)

// Get property generic function
function getProperty<T extends object, K extends keyof T>(obj: T | undefined, key: K): T[K] | undefined {
  if (!obj) return undefined
  return obj[key]
}

const getName: string | undefined = getProperty(eventDatabase[0], "name")
console.log(getName)

const getType: EventType | undefined = getProperty(eventDatabase[3], "type")
console.log(getType)

if (getType === undefined) {
  console.log("Could not find the type of event you're looking for.")
} else if (getType.kind === EventKind.Festival) {
  const getDateRange: [string, string] | undefined = getProperty(getType, "dateRange")
  console.log(getDateRange)
}

// Is Date Valid
function isValidDate(date: string): boolean {
  return !isNaN(Date.parse(date))
}

// Helper function to check if date exists and if so is it valid
function doesDateExist(e: Omit<AppEvent, "id">): boolean {
  if (!e.date) return true

  const valid = isValidDate(e.date)
  if (valid) {
    return true
  } else {
    throw new Error("You must enter a valid date (i.e. - mm/dd/yyyy)")
  }
}

// Add an Event Async
async function addEventAsync(obj: Omit<AppEvent, "id">): Promise<void> {
  await delay(500)

  try {
    const lastEvent = eventDatabase[eventDatabase.length - 1]
    const newId = lastEvent ? lastEvent.id + 1 : 1

    doesDateExist(obj)

    // Immutable addition
    const newEvent: AppEvent = { id: newId, ...obj }
    eventDatabase = [...eventDatabase, newEvent]

    console.log("You successfully added your event.")
    // Pretty Prints the Event Database, showing the Date Range
    console.log(JSON.stringify(eventDatabase, null, 2))
  } catch (error) {
    console.log("The event could not be added.", error)
  }
}

addEventAsync({
  type: { kind: EventKind.Concert },
  name: "ZZ Top",
  date: "9/8/1992",
  notes: "Incredible show, worth every penny!"
})

addEventAsync({
  type: { kind: EventKind.Sports },
  name: "Cleveland Guardians v Detroit Tigers",
  date: "5/15/2017",
  notes: "Guardians won 10-9"
})

// List All Events
function listEvents(events: AppEvent[]) {
  console.log("\nList of All Events You Have Attended:\n")

  for (const currentEvent of events) {
    console.log(`Event Type: ${currentEvent.type.kind.charAt(0).toUpperCase() + currentEvent.type.kind.slice(1)}\nEvent: ${currentEvent.name.charAt(0).toUpperCase() + currentEvent.name.slice(1)}\nDate(s): ${currentEvent.date}${currentEvent.seat ? `\nSeat: ${currentEvent.seat}` : ""}${currentEvent.row ? `\nRow: ${currentEvent.row}` : ""}${currentEvent.notes ? `\nEvent Notes: ${currentEvent.notes}` : ""}\n`)
  }
}

listEvents(eventDatabase)

// Hybrid Type
type EventWithSummary = {
  event: AppEvent
  summary: string
  log(): void
}

// Single Event Summary
function createEventSummaryHelper(e: AppEvent): EventWithSummary {
  return {
    event: e,
    summary: `${e.name} - ${e.type.kind}`,
    log() {
      console.log(this.summary)
    }
  }
}

const sampleEvent = {
  id: 1,
  name: "Rock Festival",
  type: { kind: EventKind.Festival, dateRange: ["7/8/2001", "7/10/2001"] }
} satisfies AppEvent

const helper = createEventSummaryHelper(sampleEvent)
helper.log()

// UI-Friendly Events Summary
type EventsSummary = {
  totalEvents: number
  countsByKind: Partial<Record<EventKind, number>>
  notesCount: number
}

// Get Event Summary
function getEventsSummary(events: AppEvent[]): EventsSummary {
  // Count and display the total number of events
  const totalEvents = events.length

  // Object to track how many times each EventKind appears
  // Partial allows keys to be added dynamically
  const countsByKind: Partial<Record<EventKind, number>> = {}

  // Loop through each event and increment its EventKind count
  for (const event of events) {
    const kind = event.type.kind
    countsByKind[kind] = (countsByKind[kind] ?? 0) + 1
  }

  // Find and count events that include notes
  const notesCount = events.filter(event => event.notes).length

  return { totalEvents, countsByKind, notesCount }
}

getEventsSummary(eventDatabase)

// Assertion Function
function assertFestival(event: AppEvent): asserts event is AppEvent & {
  type: { kind: EventKind.Festival; dateRange: [string, string] }
} {
  if (event.type.kind !== EventKind.Festival || !event.type.dateRange) {
    throw new Error("Event is not a valid festival")
  }
}

// Assertion Function
function assertFestivalDateRange(type: EventType): asserts type is EventType & {
  kind: EventKind.Festival
  dateRange: [string, string]
} {
  if (type.kind === EventKind.Festival) {
    if (!("dateRange" in type)) {
      throw new Error("Festival is missing dateRange.")
    }
  } else {
    if ("dateRange" in type) {
      throw new Error("Only festivals can include a dateRange.")
    }
  }
}

// Validate New Event
function validateNewEvent(event: NewEventInput): void {
  if (!event.name || event.name.trim().length === 0) {
    throw new Error("You must enter a name for your event.")
  }

  if (event.date) {
    if (!isValidDate(event.date)) {
      throw new Error("You must enter a valid date (ie - 1/1/2025).")
    }
  }

  if (event.type.kind === EventKind.Festival) {
    const range = event.type.dateRange
    if (!range) throw new Error("You must enter a valid date range for a festival event.")

    const [startStr, endStr] = range
    if (!isValidDate(startStr)) throw new Error("Your start date must be valid (ie - 1/1/2025).")
    if (!isValidDate(endStr)) throw new Error("Your end date must be valid (ie - 1/3/2025).")

    const start = new Date(startStr)
    const end = new Date(endStr)
    if (start > end) throw new Error("Festival start date must be before the end date.")
  }
}

// A "view model" type — this is NOT the domain model (AppEvent)
// This represents exactly what the UI needs to render a row
// This will be props for a future React <EventRow /> component
type EventViewRow = {
  id: number
  name: string
  emoji: string
  dateText: string
}

// Options object used to control how the view model is built
// (classic "options object" pattern)
type ViewEventOptions = {
  kind: EventKind
  showDates?: boolean
  showEmojis?: boolean
}

// Transforms raw AppEvent data into UI-ready view models
function getEventsByKindViewModel(events: readonly AppEvent[], options: ViewEventOptions): EventViewRow[] {
  // The readonly prevents accidental mutation of the input array

  // Destructure options and provide default values
  // This ensures the function behaves consistently even if options are partial
  const { kind, showDates = true, showEmojis = true } = options

  // Select an emoji pair based on the event kind
  const emojiSet = kind === EventKind.Concert ? ["🎵", "🎸"] : kind === EventKind.Sports ? ["💪", "🎽"] : kind === EventKind.Festival ? ["🎶✨", "🎤🎉"] : kind === EventKind.Theater ? ["🎭", "🎬"] : kind === EventKind.Conference ? ["🗣", "💬"] : kind === EventKind.Wedding ? ["👰🏻🤵🏻", "🥂"] : kind === EventKind.Museum ? ["🏛️", "🖼️"] : ["⭐", "✨"]

  // Step 1: Filter events down to only the requested kind
  // Step 2: Map each event into a UI-friendly EventViewRow
  return events
    .filter(event => event.type.kind === kind)
    .map((event, index) => {
      // Pick an emoji if emojis are enabled
      // index % 2 alternates between the two emoji options
      // `?? ""` guarantees a string which is important for React rendering
      const emoji = showEmojis ? emojiSet[index % 2] ?? "" : ""

      // Festival events require special handling due to date ranges
      if (kind === EventKind.Festival) {
        // Assertion narrows the type so dateRange is guaranteed to exist
        assertFestival(event)
        // Destructure the start and end dates from the festival date range
        const [start, end] = event.type.dateRange
        // Return a fully UI-safe view model
        return {
          id: event.id,
          name: event.name,
          emoji,
          dateText: `${start} - ${end}`
        }
      }

      // Non-festival events use a single date (if available)
      return {
        id: event.id,
        name: event.name,
        emoji,
        // Conditionally include the date based on UI options
        // Always returns a string to keep rendering predictable
        dateText: showDates ? event.date ?? "" : ""
      }
    })
}
getEventsByKindViewModel(eventDatabase, { kind: EventKind.Concert })
getEventsByKindViewModel(eventDatabase, { kind: EventKind.Sports })
getEventsByKindViewModel(eventDatabase, { kind: EventKind.Festival })
// viewEventType(eventDatabase, {kind: EventKind.Theater})

// Get Event by ID
function getEventById(eventId: number): AppEvent | undefined {
  return eventDatabase.find(event => event.id === eventId)
}

console.log(`\nHere is the event you wanted to view by ID:`)
console.log(getEventById(3))

// View Single Event
function viewEvent(id: number, container: HTMLElement | null): void {
  const singleEvent = getEventById(id)

  if (!singleEvent) {
    console.log(`❌ No event found with ID: ${id}\n`)
    return
  }

  const formattedKind = singleEvent.type?.kind ? singleEvent.type.kind.charAt(0).toUpperCase() + singleEvent.type.kind.slice(1) : "Unknown"

  const dateDisplay = singleEvent.type.kind === EventKind.Festival ? singleEvent.type.dateRange?.join(" - ") ?? "Date range unavailable" : singleEvent.date ?? "Date unavailable"

  if (container) {
    container.innerHTML = `
    <h1 class="toUpper">Event Requested</h1>\n
    <h2>Event Type: ${formattedKind}</h2>
<p><strong>Event:</strong> ${singleEvent.name ?? "Unnamed Event"}</p>
<p><strong>Date(s):</strong> ${dateDisplay}</p>
<p><strong>Seat:</strong> ${singleEvent.seat ?? "N/A"}</p>
<p><strong>Row:</strong> ${singleEvent.row ?? "N/A"}</p>
<p><strong>Event Notes:</strong> ${singleEvent.notes ?? "N/A"}</p>
`
  }
}

const container: HTMLElement | null = document.getElementById("event-view")
viewEvent(2, container)

// Mapped Type to make sure ID can't be edited
type EditableEventFields = {
  [K in keyof AppEvent as K extends "id" ? never : K]: AppEvent[K]
}

type EventFieldUpdate = Partial<Omit<EditableEventFields, "type">>

// Edit Single Event - keeping Partial in there as a helper - makes all Event props optional for update - refactor below function at some point, removing the if statements and replacing with less code
function editEvent(eventID: number, updates: EventFieldUpdate & { type?: EventTypeUpdate }): Result<AppEvent> {
  const eventToEdit = getEventById(eventID)
  if (!eventToEdit) {
    return { ok: false, error: `Event id: ${eventID} was not found.` }
  }

  const { type: typeUpdates, ...updatesWithoutID } = updates

  // Create the updated event immutably
  const updatedEvent: AppEvent = {
    ...eventToEdit,
    ...updatesWithoutID,
    type: eventToEdit.type // we'll apply type updates next
  }

  // Apply type updates immutably
  if (typeUpdates && updatedEvent.type.kind === EventKind.Festival) {
    updatedEvent.type = { ...updatedEvent.type, ...typeUpdates }
  }

  // Replace in database
  eventDatabase = eventDatabase.map(e => (e.id === eventID ? updatedEvent : e))

  console.log(`Event id: ${eventID} has been updated. Here is the updated event database: \n`)
  console.log(JSON.stringify(eventDatabase, null, 2))

  return { ok: true, data: updatedEvent }
}

editEvent(1, { notes: "The Browns won by 17! Big win!", seat: 10 })
// editEvent(2, { id: 10, notes: "Wowzers!", row: 10, seat: 30 })
editEvent(3, {
  type: { dateRange: ["2025-01-01", "2025-01-03"] }
})
editEvent(10, { notes: "This shouldn't work." })

// Safe Event Field Picker
function getEventField<K extends keyof AppEvent>(event: AppEvent, key: K): AppEvent[K] {
  return event[key]
}

function getFirstEventName(): string {
  if (eventDatabase.length === 0) {
    throw new Error("No events in database")
  }

  const firstEvent = eventDatabase[0]

  if (!firstEvent) {
    throw new Error("Unexpected empty database")
  }

  return getEventField(firstEvent, "name")
}

const eventName = getFirstEventName()
console.log(eventName)

// Showcasing map()
const eventNames = eventDatabase.map(event => event.name)
console.log(eventNames)

// Showcasing map() pulling in all event ids to new array
const eventIDs = eventDatabase.map(events => events.id)
console.log(eventIDs)

// Showcasing filter() and finding a string pattern based on an event name
const eventNamePattern = eventDatabase.filter(eventName => eventName.name === "Cleveland Browns v Pittsburgh Steelers")
console.log(eventNamePattern)

// Backend / API Layer
namespace EventService {
  export function addEvent(event: NewEventInput): Result<readonly AppEvent[]> {
    validateNewEvent(event)
    assertFestivalDateRange(event.type)
    const lastEvent = eventDatabase[eventDatabase.length - 1]
    const newId = (lastEvent?.id ?? 0) + 1

    const newEvent: AppEvent = { id: newId, ...event }
    eventDatabase = [...eventDatabase, newEvent]

    return { ok: true, data: eventDatabase }
  }

  export function fetchEventsSafe(): Result<readonly AppEvent[]> {
    if (eventDatabase.length === 0) {
      return { ok: false, error: "No events found" }
    }

    return { ok: true, data: eventDatabase }
  }

  export function deleteEvent(id: number): readonly AppEvent[] {
    eventDatabase = eventDatabase.filter(e => e.id !== id)
    return eventDatabase
  }

  console.log("Before addEvent:", eventDatabase)

  const result = addEvent({
    type: { kind: EventKind.Festival, dateRange: ["9/12/2011", "9/14/2011"] },
    name: "Phases of the Moon",
    notes: "Flooding happened pre-festival causing a 12 hour delay getting into the campground."
  })

  console.log("Result:", result)

  // addEvent({
  //   type: { kind: EventKind.Festival },
  //   name: "Forecastle Festival",
  //   notes: "Super hot but a lot of fun"
  // })

  // addEvent({
  //   type: { kind: EventKind.Concert, dateRange: ["9/12/2021", "9/14/2021"] },
  //   name: "Phish",
  //   notes: "Trey was on another level for this one."
  // })

  const resultTwo = addEvent({
    type: { kind: EventKind.Concert },
    name: "Phish",
    date: "7/12/2023",
    notes: "Fishman messed up on drums."
  })

  console.log("ResultTwo:", resultTwo)

  const resultThree = addEvent({
    type: { kind: EventKind.Other },
    name: "Tech Event",
    notes: "They had good snacks there."
  })

  console.log("ResultThree:", resultThree)

  console.log("After addEvent:", eventDatabase)
}

showEvents()
