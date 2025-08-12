import type { Event } from './event';
import type { AuthUser } from './user';

export type Booking = {
  id: string;
  event: Event;
  user: AuthUser;
  createdAt: string;
  updatedAt: string;
};
