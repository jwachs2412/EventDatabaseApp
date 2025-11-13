"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Event Database Array
const eventDatabase = [
    { id: 0, type: "concert", name: "Chris Stapleton", date: "12/12/2018", row: 8, seat: 23, notes: "The concert was outstanding. 10/10" },
    { id: 1, type: "sports", name: "Cleveland Browns v Pittsburgh Steelers", date: "11/6/1998", notes: "The Browns won 23-14 and played outstanding. 10/10" },
    { id: 2, type: "concert", name: "Led Zepplin", date: "6/19/1974", row: "FF", seat: 2, notes: "The concert was outstanding. Led Zepplin blew the roof off! 10/10" },
    { id: 3, type: "festival", name: "Bonnaroo", date: "7/12/2024 - 7/14/2024" }
];
// AUTHOR SUGGESTION
// Capitalization Function
// function capitalize(word: string): string {
//   return word.charAt(0).toUpperCase() + word.slice(1)
// }
// Add an Event
function addEvent(obj) {
    eventDatabase.push(obj);
    console.log(eventDatabase);
    return eventDatabase;
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
    type: "theater",
    name: "Hamilton",
    date: "9/8/2023",
    notes: "Incredible show, worth every penny!"
});
// List All Events
function listEvents(events) {
    console.log("\nList of All Events You Have Attended:\n");
    for (const currentEvent of events) {
        console.log(`Event Type: ${currentEvent.type.charAt(0).toUpperCase() + currentEvent.type.slice(1)}\nEvent: ${currentEvent.name.charAt(0).toUpperCase() + currentEvent.name.slice(1)}\nDate(s): ${currentEvent.date}\nSeat: ${currentEvent.seat ? currentEvent.seat : "N/A"}\nRow: ${currentEvent.row ? currentEvent.row : "N/A"}\nEvent Notes: ${currentEvent.notes ? currentEvent.notes : "N/A"}\n`);
    }
}
listEvents(eventDatabase);
// View Events by Type
function viewEventType(events, type) {
    if (events.length === 0) {
        console.log(`No events found for ${type}`);
        return;
    }
    const eventType = events.filter(event => event.type.toLowerCase() === type.toLowerCase());
    console.log(`\nFiltering by "${type}"...`);
    if (type === "concert") {
        for (const event of eventType) {
            console.log(`🎸 ${event.name} -- ${event.date}`);
        }
    }
    else if (type === "sports") {
        for (const event of eventType) {
            console.log(`💪 ${event.name} -- ${event.date}`);
        }
    }
    else if (type === "festival") {
        for (const event of eventType) {
            console.log(`🎤🎉 ${event.name} -- ${event.date}`);
        }
    }
    else {
        for (const event of eventType) {
            if (event.id % 2 === 0) {
                console.log(`${event.name} -- ${event.date}`);
            }
            else {
                console.log(`${event.name} -- ${event.date}`);
            }
        }
    }
    // AUTHOR'S SUGGESTION
    //   for (const e of eventType) {
    //     console.log(`${e.name} — ${e.date}`)
    //   }
}
viewEventType(eventDatabase, "concert");
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
        console.log(`Event Type: ${singleEvent.type.charAt(0).toUpperCase() + singleEvent.type.slice(1)}\nEvent: ${singleEvent.name.charAt(0).toUpperCase() + singleEvent.name.slice(1)}\nDate(s): ${singleEvent.date}\nSeat: ${singleEvent.seat ? singleEvent.seat : "N/A"}\nRow: ${singleEvent.row ? singleEvent.row : "N/A"}\nEvent Notes: ${singleEvent.notes ? singleEvent.notes : "N/A"}\n`);
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
function editEvent(id, updates) {
    const eventToEdit = getEventById(id);
    if (eventToEdit) {
        if (updates.type) {
            eventToEdit.type = updates.type;
        }
        if (updates.name) {
            eventToEdit.name = updates.name;
        }
        if (updates.date) {
            eventToEdit.date = updates.date;
        }
        if (updates.row) {
            eventToEdit.row = updates.row;
        }
        if (updates.seat) {
            eventToEdit.seat = updates.seat;
        }
        if (updates.notes) {
            eventToEdit.notes = updates.notes;
        }
        console.log(`Event id: ${id} has been updated. Here is the updated event database: \n`);
        console.log(eventDatabase);
    }
    else {
        console.log(`Event id: ${id} was not found.`);
    }
}
editEvent(1, { notes: "Amazing live performance!", seat: 12 });
// Delete Event
function deleteEvent(id) {
    const index = eventDatabase.findIndex(event => event.id === id);
    if (index >= 0) {
        const eventRemoved = eventDatabase.splice(index, 1)[0];
        if (eventRemoved) {
            console.log(`\nEvent "${eventRemoved.name}" (ID: ${eventRemoved.id}) deleted successfully.`);
            console.log(eventDatabase);
        }
    }
    else {
        console.log(`\nEvent not found.`);
    }
}
deleteEvent(2);
deleteEvent(10);
//# sourceMappingURL=index.js.map