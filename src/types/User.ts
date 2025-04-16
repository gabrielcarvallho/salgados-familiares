export interface Group {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  is_admin: boolean;
  date_joined: Date;
  group: Group;
}

export interface Users {
  users: User[];
}

export interface Invite {
  email: string;
  is_admin: boolean;
  group?: number;
}

export interface Create {
  email: string;
  password: string;
}

export interface Groups {
  groups: Group[];
}


