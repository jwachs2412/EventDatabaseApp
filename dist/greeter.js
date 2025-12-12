export function greeter(person) {
    if (!person) {
        throw new Error("Enter a person's name");
    }
    return "Hello " + person;
}
let user = "Josh";
document.getElementById("output").innerText = greeter(user);
//# sourceMappingURL=greeter.js.map