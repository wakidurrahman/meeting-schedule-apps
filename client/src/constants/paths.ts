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
  profile: '/profile',
  createMeeting: '/meetings/new',
  login: '/login',
  register: '/register',
} as const;

export const NAV_PATHS: NavPath[] = [
  { to: paths.home, label: 'Home', userRole: 'USER', isAuth: true },
  { to: paths.calendar, label: 'Calendar', userRole: 'USER', isAuth: true },
  { to: paths.users, label: 'Users', userRole: 'ADMIN', isAuth: true },
  { to: paths.profile, label: 'Profile', userRole: 'USER', isAuth: true },
  { to: paths.login, label: 'Login', userRole: 'GUEST', isAuth: false },
  { to: paths.register, label: 'Register', userRole: 'GUEST', isAuth: false },
  {
    to: paths.createMeeting,
    label: 'Create Meeting',
    userRole: 'USER',
    isAuth: true,
  },
];
