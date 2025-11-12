"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventDatabase = [
    { id: 1, type: "concert", name: "Chris Stapleton", date: "12/12/2018", row: 8, seat: 23, notes: "The concert was outstanding. 10/10" },
    { id: 2, type: "sports", name: "Cleveland Browns v Pittsburgh Steelers", date: "11/6/1998", notes: "The Browns won 23-14 and played outstanding. 10/10" },
    { id: 3, type: "concert", name: "Led Zepplin", date: "6/19/1974", row: "FF", seat: 2, notes: "The concert was outstanding. Led Zepplin blew the roof off! 10/10" },
    { id: 4, type: "festival", name: "Bonnaroo", date: "7/12/2024 - 7/14/2024" }
];
function addEvent(obj) {
    eventDatabase.push(obj);
    console.log(eventDatabase);
    return eventDatabase;
}
addEvent({
    id: 5,
    type: "theater",
    name: "Hamilton",
    date: "9/8/2023",
    notes: "Incredible show, worth every penny!"
});
//# sourceMappingURL=index.js.map