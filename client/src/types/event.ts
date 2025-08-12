export type Event = {
  id: string;
  title: string;
  description?: string | null;
  date: string; // ISO string
  price: number;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type EventInput = {
  title: string;
  description?: string | null;
  date: string; // ISO
  price: number;
};
