"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Event Database Array
const eventDatabase = [
    { id: 0, type: { kind: "concert" }, name: "Chris Stapleton", date: "12/12/2018", row: 8, seat: 23, notes: "The concert was outstanding. 10/10" },
    { id: 1, type: { kind: "sports" }, name: "Cleveland Browns v Pittsburgh Steelers", date: "11/6/1998", notes: "The Browns won 23-14 and played outstanding. 10/10" },
    { id: 2, type: { kind: "concert" }, name: "Led Zepplin", date: "6/19/1974", row: "FF", seat: 2, notes: "The concert was outstanding. Led Zepplin blew the roof off! 10/10" },
    { id: 3, type: { kind: "festival", dateRange: ["7/12/2024", "7/14/2024"] }, name: "Bonnaroo" }
];
// Delay function
function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
// Manually constructed Promise
function manualEventPromise(id) {
    return new Promise((resolve, reject) => {
        const event = eventDatabase.find(e => e.id === id);
        if (event)
            resolve(event);
        else
            reject(new Error(`Event ID: ${id} not found.`));
    });
}
// Promise resolving to a promise
function resolveToAnotherPromise() {
    return Promise.resolve(delay(200).then(() => "Inner promise finished!"));
}
// Fetch all events
async function fetchEventsFromDB() {
    await delay(500);
    const events = eventDatabase;
    if (events.length === 0) {
        throw new Error("No events found in the database");
    }
    return events;
}
// Fetch events concurrently
async function fetchEventsConcurrently(ids) {
    const promises = ids.map(id => fetchEventByID(id));
    const results = await Promise.all(promises);
    const events = results.filter(e => e.ok).map(d => d.data);
    return events;
}
fetchEventsConcurrently([1, 2, 3])
    .then(events => console.log("Fetched events concurrently: ", events))
    .catch(err => console.log("Error fetching events", err));
// Show all events in database
async function showEvents() {
    console.log("Loading events...");
    try {
        const allEvents = await fetchEventsFromDB();
        console.log("Here are the list of events after a 1/2 second wait:");
        console.log(allEvents);
    }
    catch (err) {
        console.log("Error: ", err.message);
    }
    finally {
        console.log("Finished attempting to load all events in the database.");
    }
}
showEvents();
// Get All Events Safely
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
// Randomly throws error
function randomFail() {
    return Math.random() < 0.3;
}
async function fetchEventsWithFailure() {
    await delay(500);
    if (!randomFail) {
        throw new Error("Failed to fetch events.");
    }
    return eventDatabase;
}
async function test() {
    try {
        const result = await fetchEventsWithFailure();
        console.log("\nSuccess\n", result);
    }
    catch (error) {
        console.log("\nFailed\n", error);
    }
}
test();
// Loading and Error states
async function listAndDisplayEvents() {
    console.log("Loading events...");
    try {
        const result = await fetchEventsWithFailure();
        console.log("\nFinished loading!\n", result);
    }
    catch (error) {
        console.log("Failed to fetch.", error);
    }
    console.log("Done.");
    //   return eventDatabase
}
listAndDisplayEvents();
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
else if (getType.kind === "festival") {
    const getDateRange = getProperty(getType, "dateRange");
    console.log(getDateRange);
}
// AUTHOR SUGGESTION
// Capitalization Function
// function capitalize(word: string): string {
//   return word.charAt(0).toUpperCase() + word.slice(1)
// }
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
// Don't really need this as the check is already done up top
// function isEventTypeValid(e: Omit<Event, "id">): void {
//   const validEventTypes = ["concert", "sports", "festival"] as const
//   if (!validEventTypes.includes(e.type.kind)) {
//     throw new Error("You must enter concert, sports or festival for the type of event.")
//   }
// }
// Add an Event Async
async function addEventAsync(obj) {
    await delay(500);
    try {
        // isEventTypeValid(obj)
        const lastEvent = eventDatabase[eventDatabase.length - 1];
        const newId = lastEvent ? lastEvent.id + 1 : 1;
        doesDateExist(obj);
        eventDatabase.push({ id: newId, ...obj });
        console.log("You successfully added your event.");
        // Pretty Prints the Event Database, showing the Date Range
        console.log(JSON.stringify(eventDatabase, null, 2));
    }
    catch (error) {
        console.log("The event could not be added.", error);
    }
}
addEventAsync({
    type: { kind: "concert" },
    name: "ZZ Top",
    date: "9/8/1992",
    notes: "Incredible show, worth every penny!"
});
addEventAsync({
    type: { kind: "sports" },
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
// View Events by Type
function viewEventType(events, kind) {
    if (events.length === 0) {
        console.log(`No events found.`);
        return;
    }
    const eventTypes = events.map(event => event.type.kind);
    const emojis = kind === "concert" ? ["🎵", "🎸"] : kind === "sports" ? ["💪", "🎽"] : ["🎶✨", "🎤🎉"];
    if (eventTypes.includes(kind)) {
        const eventType = events.filter(event => event.type.kind.toLowerCase() === kind.toLowerCase());
        console.log(`\nFiltering by "${kind}"...`);
        if (kind === "concert") {
            eventType.forEach((event, index) => {
                const eventEmoji = index % 2 === 0 ? emojis[0] : emojis[1];
                console.log(`${eventEmoji} ${event.name} -- ${event.date}`);
            });
        }
        else if (kind === "sports") {
            eventType.forEach((event, index) => {
                const eventEmoji = index % 2 === 0 ? emojis[0] : emojis[1];
                console.log(`${eventEmoji} ${event.name} -- ${event.date}`);
            });
        }
        else if (kind === "festival") {
            eventType.forEach((event, index) => {
                const eventEmoji = index % 2 === 0 ? emojis[0] : emojis[1];
                if (event.type.kind === "festival" && event.type.dateRange) {
                    const [startDate, endDate] = event.type.dateRange;
                    console.log(`${eventEmoji} ${event.name} -- ${startDate} - ${endDate}`);
                }
                else {
                    console.log(`${eventEmoji} ${event.name} -- ${event.date}`);
                }
            });
        }
        else {
            eventType.map(event => {
                console.log(`${event.name} -- ${event.date}`);
            });
        }
    }
    else {
        console.log(`\nEvent type "${kind}" does not exist.`);
    }
    // AUTHOR'S SUGGESTION
    //   for (const e of eventType) {
    //     console.log(`${e.name} — ${e.date}`)
    //   }
}
viewEventType(eventDatabase, "concert");
viewEventType(eventDatabase, "sports");
viewEventType(eventDatabase, "festival");
// viewEventType(eventDatabase, "theater")
// viewEventType(eventDatabase, "technology")
// Get Event by ID
function getEventById(eventId) {
    return eventDatabase.find(event => event.id === eventId);
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
console.log(`\nHere is the event you wanted to view by ID:`);
console.log(getEventById(3));
// View Single Event
function viewEvent(id) {
    const singleEvent = getEventById(id);
    if (singleEvent) {
        console.log("\nHere is the event you were looking for:\n");
        console.log(`Event Type: ${singleEvent.type.kind.charAt(0).toUpperCase() + singleEvent.type.kind.slice(1)}\nEvent: ${singleEvent.name.charAt(0).toUpperCase() + singleEvent.name.slice(1)}\nDate(s): ${singleEvent.date}\nSeat: ${singleEvent.seat ? singleEvent.seat : "N/A"}\nRow: ${singleEvent.row ? singleEvent.row : "N/A"}\nEvent Notes: ${singleEvent.notes ? singleEvent.notes : "N/A"}\n`);
    }
    else {
        console.log(`❌ No event found with ID: ${id}\n`);
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
viewEvent(2);
// Edit Single Event - keeping Partial in there as a helper - makes all Event props optional for update - refactor below function at some point, removing the if statements and replacing with less code
function editEvent(eventID, updates) {
    const eventToEdit = getEventById(eventID);
    if (!eventToEdit) {
        console.log(`Event id: ${eventID} was not found.`);
        return null;
    }
    const { type: typeUpdates, id: _ignore, ...updatesWithoutID } = updates;
    Object.assign(eventToEdit, updatesWithoutID);
    // Update type fields safely
    if (typeUpdates && eventToEdit.type.kind === "festival" && typeUpdates.dateRange) {
        eventToEdit.type.dateRange = typeUpdates.dateRange;
    }
    console.log(`Event id: ${eventID} has been updated. Here is the updated event database: \n`);
    console.log(JSON.stringify(eventDatabase, null, 2));
    return eventToEdit;
}
editEvent(1, { notes: "The Browns won by 17! Big win!", seat: 10 });
editEvent(2, { id: 10, notes: "Wowzers!", row: 10, seat: 30 });
editEvent(3, {
    type: { dateRange: ["2025-01-01", "2025-01-03"] }
});
editEvent(10, { notes: "This shouldn't work." });
// Delete Event
function deleteEvent(id) {
    const index = eventDatabase.findIndex(event => event.id === id);
    if (index === -1) {
        console.log(`\nEvent not found.`);
        return;
    }
    const eventRemoved = eventDatabase.splice(index, 1)[0];
    if (eventRemoved) {
        console.log(`\nEvent "${eventRemoved.name}" (ID: ${eventRemoved.id}) deleted successfully.`);
        console.log(JSON.stringify(eventDatabase, null, 2));
    }
}
deleteEvent(2);
deleteEvent(10);
// Practice tests
async function testSyncPromiseBehavior(id) {
    console.log("Before calling manualEventPromise");
    try {
        const event = await manualEventPromise(id);
        console.log("Resolved event: ", event);
    }
    catch (e) {
        console.log("Error: ", e.message);
    }
    console.log("After calling manualEventPromise");
}
testSyncPromiseBehavior(3);
testSyncPromiseBehavior(99);
resolveToAnotherPromise().then(v => console.log(v));
// Showcasing map()
const eventNames = eventDatabase.map(events => events.name);
console.log(eventNames);
// Showcasing map() pulling in all event ids to new array
const eventIDs = eventDatabase.map(events => events.id);
console.log(eventIDs);
// Showcasing filter() and finding a string pattern based on an event name
const eventNamePattern = eventDatabase.filter(eventName => eventName.name === "Cleveland Browns v Pittsburgh Steelers");
console.log(eventNamePattern);
//# sourceMappingURL=index.js.map