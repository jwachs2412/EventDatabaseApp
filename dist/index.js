// TODO: Add persistent storage instead of in-memory DB
// TODO: Add validation for event input
// TODO: Add delete confirmation flow
// TODO: Add sorting and pagination
var EventKind;
(function (EventKind) {
    EventKind["Concert"] = "concert";
    EventKind["Festival"] = "festival";
    EventKind["Sports"] = "sports";
    EventKind["Theater"] = "theater";
    EventKind["Conference"] = "conference";
    EventKind["Wedding"] = "wedding";
    EventKind["Museum"] = "museum";
    EventKind["Other"] = "other";
})(EventKind || (EventKind = {}));
// Event Database Array
let eventDatabase = [
    { id: 1, type: { kind: EventKind.Concert }, name: "Chris Stapleton", date: "12/12/2018", row: 8, seat: 23, notes: "The concert was outstanding. 10/10" },
    { id: 2, type: { kind: EventKind.Sports }, name: "Cleveland Browns v Pittsburgh Steelers", date: "11/6/1998", notes: "The Browns won 23-14 and played outstanding. 10/10" },
    { id: 3, type: { kind: EventKind.Concert }, name: "Led Zepplin", date: "6/19/1974", row: "FF", seat: 2, notes: "The concert was outstanding. Led Zepplin blew the roof off! 10/10" },
    { id: 4, type: { kind: EventKind.Festival, dateRange: ["7/12/2024", "7/14/2024"] }, name: "Bonnaroo" }
];
// Delay function
function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
// This function sorts events by their `kind` and wires up a dropdown
// that lets the user change the sort direction (asc / desc).
// It returns a Result type so callers must handle success or failure.
function sortEventsByKind(elementId) {
    // Grab all events from our in-memory database
    // This is the list we will sort and re-render
    const allEvents = eventDatabase;
    // Guard clause: if there are no events, we fail early
    // Returning a Result instead of throwing keeps this predictable
    if (allEvents.length === 0) {
        return { ok: false, error: `No events found` };
    }
    // Configuration object for the dropdown options
    // Keeping this data-driven makes it easy to extend later
    const dropdownOpts = [
        { value: "asc", text: "Ascending" },
        { value: "desc", text: "Descending" }
    ];
    // Grab the DOM containers where we’ll render content
    // One holds the dropdown, the other holds the event list
    const sortContainer = document.getElementById("sort-container");
    const dropdownContainer = document.getElementById("dropdown-container");
    // Another guard clause:
    // If either container is missing, we can’t safely manipulate the DOM
    // So we return an error instead of crashing
    if (!dropdownContainer || !sortContainer) {
        return { ok: false, error: `Container with ID "${elementId}" not found.` };
    }
    // Create the <select> element programmatically
    // This avoids hard-coding HTML and keeps behavior encapsulated
    const selectElement = document.createElement("select");
    selectElement.id = "direction-selector";
    selectElement.name = "direction";
    // Populate the <select> with <option> elements
    // Each option comes from our configuration array
    dropdownOpts.forEach(optionData => {
        const optionElement = document.createElement("option");
        optionElement.value = optionData.value;
        optionElement.textContent = optionData.text;
        selectElement.appendChild(optionElement);
    });
    // Append the completed dropdown into the DOM
    dropdownContainer.appendChild(selectElement);
    // This helper function is responsible for rendering the event list
    // Separating rendering from sorting keeps the logic easier to reason about
    function render(list, title) {
        // Start building the HTML output
        let html = `<h2>${title}</h2><ul>`;
        // Loop through events and generate list items
        list.forEach(event => {
            // Extract the kind once for readability
            const kind = event.type.kind;
            // Festivals display a date range; other events display a single date
            // This conditional keeps that formatting logic in one place
            const date = kind === EventKind.Festival ? `${event.type.dateRange[0]} - ${event.type.dateRange[1]}` : event.date;
            // Append the event to the HTML string
            html += `<li>${kind} - ${event.name} - ${date}</li>`;
        });
        // Close the list
        html += "</ul>";
        // Inject the HTML into the page
        // The non-null assertion is safe because we guarded earlier
        sortContainer.innerHTML = html;
    }
    // Sort events alphabetically by kind on initial load
    // localeCompare handles string comparison correctly
    allEvents.sort((a, b) => a.type.kind.localeCompare(b.type.kind));
    // Render the initial sorted list
    render(allEvents, "Events List");
    // Listen for changes to the dropdown
    selectElement.addEventListener("change", event => {
        // Cast the event target so TypeScript knows it’s a <select>
        const target = event.target;
        // Read the selected value (asc or desc)
        const direction = target.value;
        // Re-sort based on the selected direction
        if (direction === "desc") {
            // Reverse alphabetical sort
            allEvents.sort((a, b) => b.type.kind.localeCompare(a.type.kind));
            render(allEvents, "Reversed Events List");
        }
        else {
            // Default ascending sort
            allEvents.sort((a, b) => a.type.kind.localeCompare(b.type.kind));
            render(allEvents, "Events List");
        }
    });
    // If everything succeeded, return the sorted events
    return { ok: true, data: allEvents };
}
const sortContainer = document.getElementById("sort-container");
sortEventsByKind(sortContainer);
// Show all events in database
function getEventsLoadState() {
    const result = EventService.fetchEventsSafe();
    if (!result.ok) {
        return {
            status: "error",
            error: result.error
        };
    }
    return {
        status: "success",
        events: result.data
    };
}
// Fetch events concurrently
async function fetchEventsConcurrently(ids) {
    const promises = ids.map(id => fetchEventByID(id));
    const results = await Promise.all(promises);
    // Custom Type Predicate - a function that acts as a user-defined type guard - parameterName is TypeName
    const events = results.filter((r) => r.ok).map(r => r.data);
    return events;
}
fetchEventsConcurrently([1, 2, 3])
    .then(events => console.log("Fetched events concurrently: ", events))
    .catch(err => console.log("Error fetching events", err));
// Get All Events Safely; batch-fetch utility
async function getAllEventsSafe(ids) {
    const promises = ids.map(id => fetchEventByID(id));
    const results = await Promise.all(promises);
    const successes = [];
    const failures = [];
    results.forEach((result, index) => {
        if (result.ok) {
            successes.push(result.data);
        }
        else if (ids[index] !== undefined) {
            failures.push(ids[index]);
        }
    });
    return { successes, failures };
}
getAllEventsSafe([1, 2, 99]).then(console.log);
// Fetch event by ID - data layer
async function fetchEventByID(id) {
    await delay(300);
    //   return eventDatabase[id]
    const event = eventDatabase.find(event => event.id === id);
    if (!event) {
        return { ok: false, error: `No event found with ID: ${id}` };
    }
    return { ok: true, data: event };
}
// fetchEventByID(999) // an ID that doesn't exist
//   .then(result => {
//     if (result.ok) {
//       console.log("Resolved: ", result.data)
//     } else {
//       console.log("Recovered from rejection: ", result.error)
//     }
//   })
// fetchEventByID(2) // an ID that does exist
//   .then(result => {
//     if (result.ok) {
//       console.log("Resolved: ", result.data)
//     } else {
//       console.log("Recovered from rejection: ", result.error)
//     }
//   })
// Show event by ID - UI/Presentation layer
async function showSingleEvent(n) {
    console.log("Loading event...");
    try {
        const soloEvent = await fetchEventByID(n);
        console.log("Here is the event you requested: ");
        console.log(soloEvent);
    }
    catch (err) {
        throw err;
    }
}
showSingleEvent(1);
// Get property generic function
function getProperty(obj, key) {
    if (!obj)
        return undefined;
    return obj[key];
}
const getName = getProperty(eventDatabase[0], "name");
// console.log(getName)
const getType = getProperty(eventDatabase[3], "type");
// console.log(getType)
if (getType === undefined) {
    console.log("Could not find the type of event you're looking for.");
}
else if (getType.kind === EventKind.Festival) {
    const getDateRange = getProperty(getType, "dateRange");
    console.log(getDateRange);
}
// Is Date Valid
function isValidDate(date) {
    return !isNaN(Date.parse(date));
}
// Helper function to check if date exists and if so is it valid
function doesDateExist(e) {
    if (!e.date)
        return true;
    const valid = isValidDate(e.date);
    if (valid) {
        return true;
    }
    else {
        throw new Error("You must enter a valid date (i.e. - mm/dd/yyyy)");
    }
}
// Add an Event Async
async function addEventAsync(obj) {
    await delay(500);
    try {
        const lastEvent = eventDatabase[eventDatabase.length - 1];
        const newId = lastEvent ? lastEvent.id + 1 : 1;
        doesDateExist(obj);
        // Immutable addition
        const newEvent = { id: newId, ...obj };
        eventDatabase = [...eventDatabase, newEvent];
        console.log("You successfully added your event.");
        // Pretty Prints the Event Database, showing the Date Range
        console.log(JSON.stringify(eventDatabase, null, 2));
    }
    catch (error) {
        console.log("The event could not be added.", error);
    }
}
addEventAsync({
    type: { kind: EventKind.Concert },
    name: "ZZ Top",
    date: "9/8/1992",
    notes: "Incredible show, worth every penny!"
});
addEventAsync({
    type: { kind: EventKind.Sports },
    name: "Cleveland Guardians v Detroit Tigers",
    date: "5/15/2017",
    notes: "Guardians won 10-9"
});
// List All Events
function listEvents(events) {
    console.log("\nList of All Events You Have Attended:\n");
    for (const currentEvent of events) {
        console.log(`Event Type: ${currentEvent.type.kind.charAt(0).toUpperCase() + currentEvent.type.kind.slice(1)}\nEvent: ${currentEvent.name.charAt(0).toUpperCase() + currentEvent.name.slice(1)}\nDate(s): ${currentEvent.date}${currentEvent.seat ? `\nSeat: ${currentEvent.seat}` : ""}${currentEvent.row ? `\nRow: ${currentEvent.row}` : ""}${currentEvent.notes ? `\nEvent Notes: ${currentEvent.notes}` : ""}\n`);
    }
}
listEvents(eventDatabase);
// Single Event Summary
function createEventSummaryHelper(e) {
    return {
        event: e,
        summary: `${e.name} - ${e.type.kind}`,
        log() {
            console.log(this.summary);
        }
    };
}
const sampleEvent = {
    id: 1,
    name: "Rock Festival",
    type: { kind: EventKind.Festival, dateRange: ["7/8/2001", "7/10/2001"] }
};
const helper = createEventSummaryHelper(sampleEvent);
helper.log();
// Get Event Summary
function getEventsSummary(events) {
    // Count and display the total number of events
    const totalEvents = events.length;
    // Object to track how many times each EventKind appears
    // Partial allows keys to be added dynamically
    const countsByKind = {};
    // Loop through each event and increment its EventKind count
    for (const event of events) {
        const kind = event.type.kind;
        countsByKind[kind] = (countsByKind[kind] ?? 0) + 1;
    }
    // Find and count events that include notes
    const notesCount = events.filter(event => event.notes).length;
    return { totalEvents, countsByKind, notesCount };
}
getEventsSummary(eventDatabase);
// Assertion Function
function assertFestival(event) {
    if (event.type.kind !== EventKind.Festival || !event.type.dateRange) {
        throw new Error("Event is not a valid festival");
    }
}
// Assertion Function
function assertFestivalDateRange(type) {
    if (type.kind === EventKind.Festival) {
        if (!("dateRange" in type)) {
            throw new Error("Festival is missing dateRange.");
        }
    }
    else {
        if ("dateRange" in type) {
            throw new Error("Only festivals can include a dateRange.");
        }
    }
}
// Validate New Event
function validateNewEvent(event) {
    if (!event.name || event.name.trim().length === 0) {
        throw new Error("You must enter a name for your event.");
    }
    if (event.date) {
        if (!isValidDate(event.date)) {
            throw new Error("You must enter a valid date (ie - 1/1/2025).");
        }
    }
    if (event.type.kind === EventKind.Festival) {
        const range = event.type.dateRange;
        if (!range)
            throw new Error("You must enter a valid date range for a festival event.");
        const [startStr, endStr] = range;
        if (!isValidDate(startStr))
            throw new Error("Your start date must be valid (ie - 1/1/2025).");
        if (!isValidDate(endStr))
            throw new Error("Your end date must be valid (ie - 1/3/2025).");
        const start = new Date(startStr);
        const end = new Date(endStr);
        if (start > end)
            throw new Error("Festival start date must be before the end date.");
    }
}
// This function converts raw domain data into UI-ready view models. It’s pure, predictable, and returns exactly what a React component needs — no more, no less.
// Transforms raw AppEvent data into UI-ready view models
function getEventsByKindViewModel(events, options) {
    // The readonly prevents accidental mutation of the input array
    // Destructure options and provide default values
    // This ensures the function behaves consistently even if options are partial
    const { kind, showDates = true, showEmojis = true } = options;
    // Select an emoji pair based on the event kind
    const emojiSet = kind === EventKind.Concert ? ["🎵", "🎸"] : kind === EventKind.Sports ? ["💪", "🎽"] : kind === EventKind.Festival ? ["🎶✨", "🎤🎉"] : kind === EventKind.Theater ? ["🎭", "🎬"] : kind === EventKind.Conference ? ["🗣", "💬"] : kind === EventKind.Wedding ? ["👰🏻🤵🏻", "🥂"] : kind === EventKind.Museum ? ["🏛️", "🖼️"] : ["⭐", "✨"];
    // Step 1: Filter events down to only the requested kind
    // Step 2: Map each event into a UI-friendly EventViewRow
    return events
        .filter(event => event.type.kind === kind)
        .map((event, index) => {
        // Pick an emoji if emojis are enabled
        // index % 2 alternates between the two emoji options
        // `?? ""` guarantees a string which is important for React rendering
        const emoji = showEmojis ? emojiSet[index % 2] ?? "" : "";
        // Festival events require special handling due to date ranges
        if (kind === EventKind.Festival) {
            // Assertion narrows the type so dateRange is guaranteed to exist
            assertFestival(event);
            // Destructure the start and end dates from the festival date range
            const [start, end] = event.type.dateRange;
            // Return a fully UI-safe view model
            return {
                id: event.id,
                name: event.name,
                emoji,
                dateText: `${start} - ${end}`
            };
        }
        // Non-festival events use a single date (if available)
        return {
            id: event.id,
            name: event.name,
            emoji,
            // Conditionally include the date based on UI options
            // Always returns a string to keep rendering predictable
            dateText: showDates ? event.date ?? "" : ""
        };
    });
}
getEventsByKindViewModel(eventDatabase, { kind: EventKind.Concert });
getEventsByKindViewModel(eventDatabase, { kind: EventKind.Sports });
getEventsByKindViewModel(eventDatabase, { kind: EventKind.Festival });
// viewEventType(eventDatabase, {kind: EventKind.Theater})
// Get Event by ID
function getEventById(eventId) {
    return eventDatabase.find(event => event.id === eventId);
}
// console.log(`\nHere is the event you wanted to view by ID:`)
// console.log(getEventById(3))
// View Single Event
function viewEvent(id, container) {
    const singleEvent = getEventById(id);
    if (!singleEvent) {
        console.log(`❌ No event found with ID: ${id}\n`);
        return;
    }
    const formattedKind = singleEvent.type?.kind ? singleEvent.type.kind.charAt(0).toUpperCase() + singleEvent.type.kind.slice(1) : "Unknown";
    const dateDisplay = singleEvent.type.kind === EventKind.Festival ? singleEvent.type.dateRange?.join(" - ") ?? "Date range unavailable" : singleEvent.date ?? "Date unavailable";
    if (container) {
        container.innerHTML = `
    <h1 class="toUpper">Event Requested</h1>\n
    <h2>Event Type: ${formattedKind}</h2>
<p><strong>Event:</strong> ${singleEvent.name ?? "Unnamed Event"}</p>
<p><strong>Date(s):</strong> ${dateDisplay}</p>
<p><strong>Seat:</strong> ${singleEvent.seat ?? "N/A"}</p>
<p><strong>Row:</strong> ${singleEvent.row ?? "N/A"}</p>
<p><strong>Event Notes:</strong> ${singleEvent.notes ?? "N/A"}</p>
`;
    }
}
const container = document.getElementById("event-view");
viewEvent(2, container);
// Edit Single Event - keeping Partial in there as a helper - makes all Event props optional for update - refactor below function at some point, removing the if statements and replacing with less code
function editEvent(eventID, updates) {
    const eventToEdit = getEventById(eventID);
    if (!eventToEdit) {
        return { ok: false, error: `Event id: ${eventID} was not found.` };
    }
    const { type: typeUpdates, ...updatesWithoutID } = updates;
    // Create the updated event immutably
    const updatedEvent = {
        ...eventToEdit,
        ...updatesWithoutID,
        type: eventToEdit.type // we'll apply type updates next
    };
    // Apply type updates immutably
    if (typeUpdates && updatedEvent.type.kind === EventKind.Festival) {
        updatedEvent.type = { ...updatedEvent.type, ...typeUpdates };
    }
    // Replace in database
    eventDatabase = eventDatabase.map(e => (e.id === eventID ? updatedEvent : e));
    console.log(`Event id: ${eventID} has been updated. Here is the updated event database: \n`);
    console.log(JSON.stringify(eventDatabase, null, 2));
    return { ok: true, data: updatedEvent };
}
editEvent(1, { notes: "The Browns won by 17! Big win!", seat: 10 });
// editEvent(2, { id: 10, notes: "Wowzers!", row: 10, seat: 30 })
editEvent(3, {
    type: { dateRange: ["2025-01-01", "2025-01-03"] }
});
editEvent(10, { notes: "This shouldn't work." });
// Safe Event Field Picker
function getEventField(event, key) {
    return event[key];
}
function getFirstEventName() {
    if (eventDatabase.length === 0) {
        throw new Error("No events in database");
    }
    const firstEvent = eventDatabase[0];
    if (!firstEvent) {
        throw new Error("Unexpected empty database");
    }
    return getEventField(firstEvent, "name");
}
const eventName = getFirstEventName();
// console.log(eventName)
// Showcasing map()
const eventNames = eventDatabase.map(event => event.name);
// console.log(eventNames)
// Showcasing map() pulling in all event ids to new array
const eventIDs = eventDatabase.map(events => events.id);
// console.log(eventIDs)
// Showcasing filter() and finding a string pattern based on an event name
const eventNamePattern = eventDatabase.filter(eventName => eventName.name === "Cleveland Browns v Pittsburgh Steelers");
// console.log(eventNamePattern)
// Backend / API Layer
var EventService;
(function (EventService) {
    function addEvent(event) {
        validateNewEvent(event);
        assertFestivalDateRange(event.type);
        const lastEvent = eventDatabase[eventDatabase.length - 1];
        const newId = (lastEvent?.id ?? 0) + 1;
        const newEvent = { id: newId, ...event };
        eventDatabase = [...eventDatabase, newEvent];
        return { ok: true, data: eventDatabase };
    }
    EventService.addEvent = addEvent;
    function fetchEventsSafe() {
        if (eventDatabase.length === 0) {
            return { ok: false, error: "No events found" };
        }
        return { ok: true, data: eventDatabase };
    }
    EventService.fetchEventsSafe = fetchEventsSafe;
    function deleteEvent(id) {
        eventDatabase = eventDatabase.filter(e => e.id !== id);
        return eventDatabase;
    }
    EventService.deleteEvent = deleteEvent;
    console.log("Before addEvent:", eventDatabase);
    const result = addEvent({
        type: { kind: EventKind.Festival, dateRange: ["9/12/2011", "9/14/2011"] },
        name: "Phases of the Moon",
        notes: "Flooding happened pre-festival causing a 12 hour delay getting into the campground."
    });
    console.log("Result:", result);
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
    });
    console.log("ResultTwo:", resultTwo);
    const resultThree = addEvent({
        type: { kind: EventKind.Other },
        name: "Tech Event",
        notes: "They had good snacks there."
    });
    console.log("ResultThree:", resultThree);
    console.log("After addEvent:", eventDatabase);
})(EventService || (EventService = {}));
getEventsLoadState();
export {};
//# sourceMappingURL=index.js.map