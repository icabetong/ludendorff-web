import { Timestamp } from "@firebase/firestore-types";

const assert = require('assert');

export const newId = (): string => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = ''
    for (let i = 0; i < 20; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    assert(id.length === 20);
    return id;
}

export const formatDate = (timestamp: Timestamp | undefined) => {
    const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' } as const;
        return timestamp !== undefined ? timestamp?.toDate().toLocaleDateString(['en-PH'], options) : "unknown" ;
}