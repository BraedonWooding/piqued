export interface Group {
  creator: string;
  name: string;
  id: number;
  user_set: User[];
  expired_at: Date | null;
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
}

export interface ChatMsg {
  message: string;
  files: string;
  userId: number;
  timestamp: Date;
  rowKey: string;
  partitionKey: string;
  seen: string;
}
