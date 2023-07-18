export interface Todo {
  id: number;
  userId: number;
  name: string;
  note: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
