import { User } from "./User";

export interface IQuote {
  _id: string; 
  name: string;
  isActive: boolean;
  brokerId: string | User;
  postedBy: string | User;
  createdAt: Date;
  updatedAt: Date;
}
