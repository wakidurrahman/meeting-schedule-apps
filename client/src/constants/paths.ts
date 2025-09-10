export type UserRole = 'USER' | 'ADMIN' | 'GUEST';

export type NavPath = {
  to: string;
  label: string;
  userRole: UserRole;
  isAuth: boolean; // true => requires auth, false => public
};

export const paths = {
  home: '/',
  calendar: '/calendar',
  users: '/users',
  userCreate: '/users/create',
  userEdit: '/users/:id/edit',
  userDetail: '/users/:id',

  createMeeting: '/meetings/new',
  events: '/events',
  eventCreate: '/events/new',
  eventEdit: '/events/:id/edit',
  bookings: '/bookings',
  login: '/login',
  register: '/register',
} as const;

export const pathsWithAuth = {
  profile: '/profile',
  logout: '/logout',
};

export const NAV_PATHS: NavPath[] = [
  { to: paths.home, label: 'Home', userRole: 'USER', isAuth: true },
  { to: paths.calendar, label: 'Calendar', userRole: 'USER', isAuth: true },
  { to: paths.users, label: 'Users', userRole: 'ADMIN', isAuth: true },

  { to: paths.login, label: 'Login', userRole: 'GUEST', isAuth: false },
  { to: paths.register, label: 'Register', userRole: 'GUEST', isAuth: false },

  { to: paths.events, label: 'Events', userRole: 'USER', isAuth: true },
  { to: paths.bookings, label: 'Bookings', userRole: 'USER', isAuth: true },
];
