export interface Todo {
  id: number;
  userId: string;
  name: string;
  note: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
