export function greeter(person: string): string {
  if (!person) {
    throw new Error("Enter a person's name")
  }

  return "Hello " + person
}

let user = "Josh"
document.getElementById("output")!.innerText = greeter(user)
