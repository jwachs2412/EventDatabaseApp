"use strict";
// TODO: Add persistent storage instead of in-memory DB
// TODO: Add validation for event input
// TODO: Add delete confirmation flow
// TODO: Add sorting and pagination
Object.defineProperty(exports, "__esModule", { value: true });
var EventKind;
(function (EventKind) {
    EventKind["Concert"] = "concert";
    EventKind["Festival"] = "festival";
    EventKind["Sports"] = "sports";
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
// Sort events
function sortEventsByName(sortDirection) {
    const allEvents = eventDatabase;
    if (allEvents.length === 0) {
        return { ok: false, error: `No events found` };
    }
    // function should return negative number (a before b), 0 (a equals b), positive number (a comes after b); localeCompare - string method that compares 2 strings according to alphabetical order
    allEvents.sort((a, b) => a.name.localeCompare(b.name));
    if (sortDirection === "desc") {
        allEvents.reverse();
    }
    return { ok: true, data: allEvents };
}
console.log(sortEventsByName("asc"));
console.log(sortEventsByName("desc"));
// Show all events in database; combines async fetching with try/catch/finally - good because readability, error safety, reliable thanks to finally, easily maintainable
async function showEvents() {
    console.log("Loading events...");
    const result = EventService.fetchEventsSafe();
    if (!result.ok) {
        console.log("Error: ", result.error);
        console.log("Finished attempting to load all events in the database.");
        return;
    }
    console.log("Here are the list of events after a 1/2 second wait:");
    console.log(result.data);
    console.log("Finished attempting to load all events in the database.");
}
showEvents();
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
fetchEventByID(999) // an ID that doesn't exist
    .then(result => {
    if (result.ok) {
        console.log("Resolved: ", result.data);
    }
    else {
        console.log("Recovered from rejection: ", result.error);
    }
});
fetchEventByID(2) // an ID that does exist
    .then(result => {
    if (result.ok) {
        console.log("Resolved: ", result.data);
    }
    else {
        console.log("Recovered from rejection: ", result.error);
    }
});
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
console.log(getName);
const getType = getProperty(eventDatabase[3], "type");
console.log(getType);
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
// Get Event Summary
function getEventSummary(events) {
    if (events.length === 0) {
        console.log("There are no events...");
        return;
    }
    const totalEvents = events.length;
    // Show total number of events attended
    console.log(`Total Events: ${totalEvents}`);
    const eventTypes = events.map(event => event.type);
    const counts = {};
    for (const event of eventTypes) {
        if (!event.kind)
            continue;
        counts[event.kind] = (counts[event.kind] ?? 0) + 1;
    }
    const eventsAttended = Object.keys(counts).map(key => {
        return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${counts[key]}`;
    });
    const eventsAttendedSummary = eventsAttended.join(" | ");
    // Show Summary of Events
    console.log(eventsAttendedSummary);
    const eventNotes = events.filter(event => event.notes);
    const notesCount = eventNotes.length;
    // Show Number of Events That Contain Notes
    console.log(`Events with notes: ${notesCount}`);
}
getEventSummary(eventDatabase);
// Assertion Function
function assertFestival(event) {
    if (event.type.kind !== EventKind.Festival || !event.type.dateRange) {
        throw new Error("Event is not a valid festival");
    }
}
// View Events by Type
function viewEventType(events, kind) {
    if (events.length === 0) {
        console.log(`No events found.`);
        return;
    }
    const eventTypes = events.map(event => event.type?.kind);
    const emojis = kind === EventKind.Concert ? ["🎵", "🎸"] : kind === EventKind.Sports ? ["💪", "🎽"] : ["🎶✨", "🎤🎉"];
    console.log(`\nFiltering by "${kind}"...`);
    const eventType = events.filter(event => event.type?.kind === kind);
    switch (kind) {
        case EventKind.Concert:
        case EventKind.Sports:
            eventType.forEach((event, index) => {
                const eventEmoji = index % 2 === 0 ? emojis[0] : emojis[1];
                console.log(`${eventEmoji} ${event.name} -- ${event.date}`);
            });
            return;
        case EventKind.Festival:
            eventType.forEach((event, index) => {
                const eventEmoji = index % 2 === 0 ? emojis[0] : emojis[1];
                assertFestival(event);
                const [startDate, endDate] = event.type.dateRange;
                console.log(`${eventEmoji} ${event.name} -- ${startDate} - ${endDate}`);
            });
            return;
        default: {
            const _exhaustive = kind;
            return _exhaustive;
        }
    }
}
viewEventType(eventDatabase, EventKind.Concert);
viewEventType(eventDatabase, EventKind.Sports);
viewEventType(eventDatabase, EventKind.Festival);
// viewEventType(eventDatabase, "theater")
// viewEventType(eventDatabase, "technology")
// Get Event by ID
function getEventById(eventId) {
    return eventDatabase.find(event => event.id === eventId);
}
console.log(`\nHere is the event you wanted to view by ID:`);
console.log(getEventById(3));
// View Single Event
function viewEvent(id) {
    const singleEvent = getEventById(id);
    if (!singleEvent) {
        console.log(`❌ No event found with ID: ${id}\n`);
        return;
    }
    const formattedKind = singleEvent.type?.kind ? singleEvent.type.kind.charAt(0).toUpperCase() + singleEvent.type.kind.slice(1) : "Unknown";
    const dateDisplay = singleEvent.type.kind === EventKind.Festival ? singleEvent.type.dateRange?.join(" - ") ?? "Date range unavailable" : singleEvent.date ?? "Date unavailable";
    console.log("\nHere is the event you were looking for:\n");
    console.log(`Event Type: ${formattedKind}
Event: ${singleEvent.name ?? "Unnamed Event"}
Date(s): ${dateDisplay}
Seat: ${singleEvent.seat ?? "N/A"}
Row: ${singleEvent.row ?? "N/A"}
Event Notes: ${singleEvent.notes ?? "N/A"}\n`);
}
viewEvent(2);
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
console.log(eventName);
// Showcasing map()
const eventNames = eventDatabase.map(event => event.name);
console.log(eventNames);
// Showcasing map() pulling in all event ids to new array
const eventIDs = eventDatabase.map(events => events.id);
console.log(eventIDs);
// Showcasing filter() and finding a string pattern based on an event name
const eventNamePattern = eventDatabase.filter(eventName => eventName.name === "Cleveland Browns v Pittsburgh Steelers");
console.log(eventNamePattern);
// Backend / API Layer
var EventService;
(function (EventService) {
    function addEvent(event) {
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
})(EventService || (EventService = {}));
//# sourceMappingURL=index.js.map