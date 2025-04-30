import { ReactNode } from "react";
import { z } from "zod";

export interface Login {
  email: string;
  password: string;
}

export type UserGroup = {
  id: number;
  name: string;
};

export type User = {
  id: string;
  email: string;
  is_admin: boolean;
  date_joined: string;
  groups: UserGroup[];
};

export type PermissionsProviderProps = {
  children: ReactNode;
};

// Contexto de permissões
export type PermissionsContextType = {
  isAdmin: boolean;
  userGroups: string[];
  canAccess: (path: string) => boolean;
  isLoading: boolean;
};



export type UserGroupName = "sales_person" | "delivery_person" | "admin";
