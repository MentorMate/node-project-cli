export interface Todo {
  id: string;
  userId: string;
  name: string;
  note: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
