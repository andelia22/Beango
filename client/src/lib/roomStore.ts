const STORAGE_KEY = 'beango_valid_rooms';

function loadRooms(): Set<string> {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  return stored ? new Set(JSON.parse(stored)) : new Set();
}

function saveRooms(rooms: Set<string>) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(rooms)));
}

export function addRoom(roomCode: string) {
  const rooms = loadRooms();
  rooms.add(roomCode);
  saveRooms(rooms);
}

export function roomExists(roomCode: string): boolean {
  const rooms = loadRooms();
  return rooms.has(roomCode);
}
