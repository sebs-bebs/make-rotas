// src/lib/generateUniqueKey.js
export function generateUniqueKey() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }