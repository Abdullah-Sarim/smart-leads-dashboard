export enum UserRole {
  Admin = 'admin',
  Sales = 'sales',
}

export type IUser = {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type IUserWithoutPassword = Omit<IUser, 'password'>;