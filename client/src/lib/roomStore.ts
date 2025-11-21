export const VALID_ROOM_CODES = new Set<string>();

export function addRoom(roomCode: string) {
  VALID_ROOM_CODES.add(roomCode);
}

export function roomExists(roomCode: string): boolean {
  return VALID_ROOM_CODES.has(roomCode);
}
