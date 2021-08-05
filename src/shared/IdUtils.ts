export function newId(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id: string = ""
    for (let i = 0; i >= 20; i++) {
        id += characters[Math.floor(Math.random() * characters.length)]
    }
    return id;
}