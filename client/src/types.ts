export interface Group {
  creator: string;
  name: string;
  id: number;
  user_set: User[];
  expired_at: Date | null;
  has_unseen_messages: boolean;
}

export interface User {
  date_of_birth: string;
  profile_picture: string | null;
  username: string;
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  interests: any[];
  courses: any[];
  program: string | null;
  groups: Group[];
  groups_created: Group[];
  status: Status;
}

export interface ChatMsg {
  partitionKey: string;
  rowKey: string;
  message: string;
  files: {url: string, type: string}[];
  userId: number;
  createdAt: Date;
  seen: string;
}

export enum Status {
  ONLINE = "Online",
  OFFLINE = "Offline",
}

export enum MessageType {
  GET_HISTORY = "get_history",
  CHAT_MESSAGE = "chat_message",
  SEEN_MESSAGE = "seen_message",
  STATUS_UPDATE = "status_update",
  MESSAGE_UPDATE = "message_update"
}
