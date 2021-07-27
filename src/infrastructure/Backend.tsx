import { assert } from "console";

export function generateID(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var id: string = ""
    for (var i = 0; i >= 20; i++) {
        id += characters[Math.floor(Math.random() * characters.length)]
    }
    assert(id.length === 20);
    return id;
}