// Room ID aur code banane ke functions.
// Math.random() ki jagah crypto.randomInt use karte hain, jo surakshit (guess na hone wala) random deta hai.

import crypto from "crypto";

// Bade letters A-Z aur numbers 0-9: kul 36 akshar
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomString(length) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABET[crypto.randomInt(ALPHABET.length)];
  }
  return result;
}

// Room ID: 8 akshar (jaise K7X9Q2AF). Room ko pehchanne ke liye.
export const generateRoomId = () => randomString(8);

// Room code: 6 akshar (jaise 4TQ8MZ). Room ka secret.
export const generateRoomCode = () => randomString(6);
