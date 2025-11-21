const ROOMS_KEY = 'beango_rooms';
const CURRENT_USER_KEY = 'beango_current_user';

export interface Participant {
  id: string;
  name: string;
  tasksCompleted: number;
}

export interface Room {
  code: string;
  city: string;
  participants: Participant[];
}

function loadRooms(): Record<string, Room> {
  const stored = sessionStorage.getItem(ROOMS_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveRooms(rooms: Record<string, Room>) {
  sessionStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
}

export function getCurrentUser(): string {
  let userId = sessionStorage.getItem(CURRENT_USER_KEY);
  if (!userId) {
    userId = `user_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(CURRENT_USER_KEY, userId);
  }
  return userId;
}

export function addRoom(roomCode: string, city: string) {
  const rooms = loadRooms();
  const userId = getCurrentUser();
  
  rooms[roomCode] = {
    code: roomCode,
    city,
    participants: [
      {
        id: userId,
        name: "You",
        tasksCompleted: 0,
      }
    ]
  };
  
  saveRooms(rooms);
}

export function joinRoom(roomCode: string): boolean {
  const rooms = loadRooms();
  const room = rooms[roomCode];
  
  if (!room) {
    return false;
  }
  
  const userId = getCurrentUser();
  const existingParticipant = room.participants.find(p => p.id === userId);
  
  if (!existingParticipant) {
    room.participants.push({
      id: userId,
      name: "You",
      tasksCompleted: 0,
    });
    saveRooms(rooms);
  }
  
  return true;
}

export function roomExists(roomCode: string): boolean {
  const rooms = loadRooms();
  return !!rooms[roomCode];
}

export function getRoom(roomCode: string): Room | null {
  const rooms = loadRooms();
  return rooms[roomCode] || null;
}

export function updateParticipantProgress(roomCode: string, userId: string, tasksCompleted: number) {
  const rooms = loadRooms();
  const room = rooms[roomCode];
  
  if (room) {
    const participant = room.participants.find(p => p.id === userId);
    if (participant) {
      participant.tasksCompleted = tasksCompleted;
      saveRooms(rooms);
    }
  }
}
