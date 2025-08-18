# Meeting Scheduler Implementation Guide

## 📅 Overview

This document provides a comprehensive guide to the Meeting Scheduler implementation - a full-stack internal virtual meeting scheduler app similar to Google Calendar or Microsoft Teams. The implementation follows atomic design principles and uses specialized templates instead of the general BaseTemplate.

---

## 🏗️ Architecture Overview

### **Design Principles**

- **Atomic Design Pattern**: Components organized as atoms → molecules → organisms → templates
- **Specialized Templates**: Dedicated meeting templates instead of BaseTemplate
- **JST Timezone Support**: All date/time functions use Japan Standard Time
- **Type Safety**: Comprehensive TypeScript types for all components
- **Conflict Prevention**: Real-time meeting conflict detection
- **Optimistic Updates**: Apollo cache integration for smooth UX

### **Key Features**

- ✅ **Meeting Creation**: Modal-based quick creation with conflict checking
- ✅ **Calendar Views**: Month/Week/Day/Year views with meeting display
- ✅ **Meeting Management**: Edit, delete, attendee management
- ✅ **Conflict Detection**: Real-time overlap and adjacency checking
- ✅ **Internal Users Only**: Only registered users can be invited
- ✅ **Dashboard Views**: Meeting lists and management interface
- ✅ **Responsive Design**: Mobile-friendly layouts

---

## 📁 File Structure

```
client/src/
├── components/
│   ├── atoms/
│   │   └── react-select/           # Multi-select for attendees
│   ├── molecules/
│   │   ├── card/                   # Meeting cards
│   │   ├── table/                  # Meeting tables
│   │   ├── pagination/             # Calendar navigation
│   │   └── modal/                  # Meeting modals
│   ├── organisms/
│   │   └── calendar/               # [PLANNED] Calendar grid
│   └── templates/
│       └── meeting-templates/      # ✅ Specialized templates
├── pages/
│   ├── calendar/                   # [PLANNED] Main calendar page
│   ├── dashboard/                  # [PLANNED] Meeting dashboard
│   └── meeting/
│       ├── create/                 # ✅ Meeting creation
│       ├── edit/[id]/             # [PLANNED] Meeting editing
│       └── [id]/                  # [PLANNED] Meeting details
├── types/
│   └── calendar.ts                 # ✅ Calendar & meeting types
├── utils/
│   ├── calendar.ts                 # ✅ Calendar utilities
│   ├── meeting.ts                  # ✅ Meeting utilities
│   └── date.ts                     # ✅ JST timezone utilities
└── graphql/
    └── meeting/                    # ✅ Meeting queries/mutations
```

---

## 🎨 Meeting Templates

### **CalendarTemplate** (`/components/templates/meeting-templates/CalendarTemplate.tsx`)

**Purpose**: Specialized layout for calendar views with dedicated areas for calendar grid and sidebar.

```tsx
<CalendarTemplate
  calendarHeader={<CalendarNavigation />}
  calendarContent={<CalendarGrid />}
  sidebar={<MiniCalendar />}
  modals={<MeetingModals />}
  showSidebar={true}
/>
```

**Features**:

- Dedicated calendar header for navigation controls
- Main calendar content area with responsive grid
- Optional sidebar for mini-calendar and meeting list
- Modal overlay area for meeting creation/details
- Responsive design with collapsible sidebar

**Layout Structure**:

```
┌─────────────────────────────────────┐
│ Header (Navigation Bar)             │
├─────────────────────────────────────┤
│ Calendar Header (Controls)          │
├─────────────────────────────────────┤
│ Calendar Content    │ Sidebar       │
│ (Calendar Grid)     │ (Mini Cal)    │
│                     │ (Meetings)    │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

### **MeetingDashboardTemplate** (`/components/templates/meeting-templates/MeetingDashboardTemplate.tsx`)

**Purpose**: Layout for meeting management dashboard with stats and quick actions.

```tsx
<MeetingDashboardTemplate
  dashboardHeader={<DashboardStats />}
  mainContent={<MeetingsList />}
  quickActions={<QuickActions />}
  modals={<CreateModal />}
/>
```

**Features**:

- Dashboard header with meeting statistics
- Main content area for meeting tables/cards
- Quick actions sidebar with create buttons
- Modal support for meeting operations
- Responsive column layout

### **MeetingDetailTemplate** (`/components/templates/meeting-templates/MeetingDetailTemplate.tsx`)

**Purpose**: Layout for meeting detail/edit pages with breadcrumbs and actions.

```tsx
<MeetingDetailTemplate
  breadcrumb={<Breadcrumb />}
  meetingHeader={<MeetingActions />}
  meetingContent={<MeetingForm />}
  centered={true}
  modals={<ConfirmDelete />}
/>
```

**Features**:

- Breadcrumb navigation
- Meeting header with title and actions
- Centered layout option for forms
- Optional sidebar for related information
- Modal support for confirmations

---

## 🛠️ Utility Functions

### **Calendar Utils** (`/utils/calendar.ts`)

#### **Core Functions**:

```typescript
// Generate monthly calendar grid with meetings
generateCalendarGrid(year: number, month: number, meetings: MeetingEvent[]): CalendarGrid

// Format dates in JST timezone
formatCalendarDate(date: Date, format: 'short' | 'long' | 'numeric' | 'header'): string

// Navigation functions
navigateMonth(date: Date, direction: 'next' | 'previous'): Date
navigateWeek(date: Date, direction: 'next' | 'previous'): Date
navigateDay(date: Date, direction: 'next' | 'previous'): Date

// Get calendar view titles
getCalendarViewTitle(date: Date, view: CalendarViewType): string

// Time slot generation
getTimeSlots(date: Date, interval: number, startHour: number, endHour: number): Date[]

// Date utilities
getCurrentWeekDates(date: Date): Date[]
isSameDay(date1: Date, date2: Date): boolean
isWeekend(date: Date): boolean
isPastDate(date: Date): boolean
```

#### **Calendar Grid Structure**:

```typescript
interface CalendarGrid {
  weeks: CalendarWeek[]; // Array of weeks
  currentMonth: number; // Month being displayed
  currentYear: number; // Year being displayed
  totalDays: number; // Total days in grid
}

interface CalendarWeek {
  days: CalendarDay[]; // 7 days in week
  weekNumber: number; // Week number
}

interface CalendarDay {
  date: Date; // Actual date
  isToday: boolean; // Is today
  isCurrentMonth: boolean; // Belongs to current month
  isPreviousMonth: boolean; // Previous month overflow
  isNextMonth: boolean; // Next month overflow
  dayNumber: number; // Day number (1-31)
  meetings: MeetingEvent[]; // Meetings for this day
}
```

### **Meeting Utils** (`/utils/meeting.ts`)

#### **Conflict Detection**:

```typescript
// Check for meeting time conflicts
checkMeetingConflicts(
  newMeeting: MeetingFormData | MeetingEvent,
  existingMeetings: MeetingEvent[],
  allowAdjacent: boolean = true
): MeetingConflict[]

// Check attendee availability
checkAttendeeAvailability(
  attendeeIds: string[],
  startTime: Date,
  endTime: Date,
  existingMeetings: MeetingEvent[]
): AttendeeAvailability[]
```

#### **Validation & Formatting**:

```typescript
// Validate meeting form data
validateMeetingData(meetingData: MeetingFormData): MeetingValidationResult

// Format meeting time ranges (JST)
formatMeetingTimeRange(startTime: Date, endTime: Date, format: 'short' | 'long' | 'duration'): string

// Calculate duration
calculateMeetingDuration(startTime: Date, endTime: Date): number

// Format attendee lists
formatAttendeeList(attendees: Array<{id: string, name: string}>, maxDisplay: number): string
```

#### **DateTime Utilities**:

```typescript
// Convert between datetime-local and Date objects
dateToDatetimeLocal(date: Date): string
datetimeLocalToDate(dateTimeLocal: string): Date

// Get smart default meeting times
getDefaultMeetingTimes(referenceDate?: Date, durationMinutes?: number): {startTime: string, endTime: string}

// Group meetings by date
groupMeetingsByDate(meetings: MeetingEvent[]): Map<string, MeetingEvent[]>

// Get meeting status
getMeetingStatus(meeting: MeetingEvent): 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
```

#### **Optimistic Updates**:

```typescript
// Generate optimistic meeting for Apollo cache
generateOptimisticMeeting(meetingData: MeetingFormData, tempId?: string): MeetingEvent
```

---

## 📝 Type Definitions

### **Core Types** (`/types/calendar.ts`)

```typescript
// Calendar Views
type CalendarViewType = 'day' | 'week' | 'month' | 'year';

// Meeting Event
interface MeetingEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees?: Array<{ id: string; name: string }>;
  description?: string;
  isAllDay?: boolean;
}

// Meeting Form Data
interface MeetingFormData {
  title: string;
  description?: string;
  startTime: string | Date;
  endTime: string | Date;
  attendeeIds?: string[];
  isAllDay?: boolean;
}

// Meeting Conflicts
interface MeetingConflict {
  meeting: MeetingEvent;
  conflictType: 'overlap' | 'adjacent' | 'duplicate';
  severity: 'error' | 'warning' | 'info';
  message: string;
}

// Validation Results
interface MeetingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Attendee Availability
interface AttendeeAvailability {
  userId: string;
  isAvailable: boolean;
  conflictingMeetings: MeetingEvent[];
}
```

### **Component Props**

```typescript
// Calendar Component Props
interface CalendarProps extends BaseComponentProps {
  view: CalendarViewType;
  selectedDate: Date;
  meetings: MeetingEvent[];
  onDateClick?: (date: Date) => void;
  onMeetingClick?: (meeting: MeetingEvent) => void;
  onCreateMeeting?: (date?: Date) => void;
  loading?: boolean;
  showWeekends?: boolean;
}

// Meeting Modal Props
interface MeetingModalProps extends BaseComponentProps {
  show: boolean;
  onHide: () => void;
  meeting?: MeetingEvent | null;
  selectedDate?: Date;
  availableUsers?: Array<{ id: string; name: string; email: string }>;
  loading?: boolean;
  onSave?: (meetingData: MeetingFormData) => void;
  onDelete?: (meetingId: string) => void;
}
```

---

## 🔄 Implementation Flow

### **Meeting Creation Flow**

1. **Calendar Date Click** → Quick Create Modal opens with pre-selected date
2. **+ Create Button** → Full Create Modal opens with form
3. **Form Input** → Real-time validation and conflict checking
4. **Attendee Selection** → Multi-select using ReactSelectField
5. **Submit** → Optimistic update + GraphQL mutation
6. **Success** → Modal closes + calendar updates

```typescript
// Example implementation
const handleCreateMeeting = async (date?: Date) => {
  setShowCreateModal(true);
  if (date) {
    const defaultTimes = getDefaultMeetingTimes(date);
    setFormDefaults(defaultTimes);
  }
};

const handleSubmit = async (formData: MeetingFormData) => {
  // Validate
  const validation = validateMeetingData(formData);
  if (!validation.isValid) return;

  // Check conflicts
  const conflicts = checkMeetingConflicts(formData, existingMeetings);
  if (conflicts.some((c) => c.severity === 'error')) return;

  // Optimistic update
  const tempMeeting = generateOptimisticMeeting(formData);

  // Submit
  await createMeeting({ variables: { input: formData } });
};
```

### **Conflict Detection Flow**

1. **Time Input Change** → Debounced conflict check (300ms)
2. **Attendee Selection** → Check attendee availability
3. **Real-time Feedback** → Show warnings/errors in UI
4. **Submit Validation** → Final conflict check before submission

```typescript
// Example conflict checking
const checkConflicts = useMemo(
  () =>
    debounce((formData: MeetingFormData) => {
      const conflicts = checkMeetingConflicts(formData, meetings);
      const availability = checkAttendeeAvailability(
        formData.attendeeIds || [],
        new Date(formData.startTime),
        new Date(formData.endTime),
        meetings
      );

      setConflicts(conflicts);
      setAttendeeAvailability(availability);
    }, 300),
  [meetings]
);
```

---

## 🎯 GraphQL Integration

### **Existing Mutations**

```graphql
# Meeting Creation
mutation CREATE_MEETING($input: CreateMeetingInput!) {
  createMeeting(input: $input) {
    id
    title
    description
    startTime
    endTime
    attendees {
      id
      name
    }
  }
}
```

### **Required Queries** (To Be Added)

```graphql
# Get meetings by date range
query GET_MEETINGS_BY_DATE_RANGE($start: String!, $end: String!) {
  meetingsByDateRange(start: $start, end: $end) {
    id
    title
    startTime
    endTime
    attendees {
      id
      name
    }
  }
}

# Get user's meetings
query GET_MY_MEETINGS($userId: ID!) {
  myMeetings(userId: $userId) {
    id
    title
    startTime
    endTime
    status
  }
}
```

---

## 🏛️ Component Architecture

### **Calendar Organism** (Next Implementation)

```
Calendar/
├── index.tsx              # Main Calendar component
├── CalendarGrid.tsx       # Month view grid
├── CalendarHeader.tsx     # Navigation controls
├── CalendarEvent.tsx      # Meeting event display
└── CalendarNavigation.tsx # View switcher
```

**CalendarGrid Features**:

- Responsive month/week/day views
- Meeting event placement
- Click handlers for date/meeting selection
- Loading states and skeletons
- Weekend highlighting
- Today highlighting

**CalendarEvent Features**:

- Compact meeting display
- Time range display
- Attendee count
- Click to view details
- Color coding by status
- Overflow handling (..."3 more")

### **Meeting Molecules** (Next Implementation)

```
Meeting/
├── MeetingCard.tsx        # Meeting summary cards
├── MeetingList.tsx        # List of meetings
├── QuickCreateModal.tsx   # Fast meeting creation
├── MeetingDetailsModal.tsx # Meeting view popup
└── AttendeeSelector.tsx   # Uses ReactSelectField
```

---

## 📱 Responsive Design

### **Breakpoints**

```scss
// Mobile First Design
.calendar-template {
  // Mobile (default)
  &__sidebar {
    display: none; // Hidden on mobile
  }

  // Tablet
  @media (min-width: 768px) {
    &__sidebar {
      display: block;
      border-top: 1px solid var(--bs-border-color);
    }
  }

  // Desktop
  @media (min-width: 992px) {
    &__sidebar {
      border-top: none;
      border-left: 1px solid var(--bs-border-color);
    }
  }
}
```

### **Mobile Optimizations**

- Collapsible sidebars
- Full-screen modals on mobile
- Touch-friendly tap targets (44px minimum)
- Swipe navigation for calendar
- Simplified mobile calendar views

---

## 🔒 Security & Permissions

### **Access Control**

- Only authenticated users can create meetings
- Only registered users can be invited as attendees
- Meeting creators can edit/delete their meetings
- Attendees can view but not edit meetings

### **Data Validation**

- Server-side validation for all meeting data
- XSS protection for meeting titles/descriptions
- Meeting time bounds checking (business hours warnings)
- Attendee validation (must be registered users)

---

## ⚡ Performance Optimizations

### **Calendar Rendering**

- Virtualized calendar grids for large datasets
- Memoized calendar calculations
- Debounced search and filtering
- Lazy loading for meeting details

### **Apollo Cache Strategy**

```typescript
// Optimistic Updates
const optimisticResponse = {
  createMeeting: generateOptimisticMeeting(formData),
};

// Cache Updates
const updateCache = (cache, { data }) => {
  const existing = cache.readQuery({ query: GET_MEETINGS });
  cache.writeQuery({
    query: GET_MEETINGS,
    data: {
      meetings: [...existing.meetings, data.createMeeting],
    },
  });
};
```

---

## 🧪 Testing Strategy

### **Unit Tests**

```typescript
// Utility function tests
describe('checkMeetingConflicts', () => {
  it('should detect overlapping meetings', () => {
    const existing = [mockMeeting1];
    const newMeeting = mockOverlappingMeeting;
    const conflicts = checkMeetingConflicts(newMeeting, existing);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].conflictType).toBe('overlap');
  });
});

// Component tests
describe('CalendarGrid', () => {
  it('should render meetings correctly', () => {
    const calendar = generateCalendarGrid(2025, 7, mockMeetings);
    render(<CalendarGrid calendarGrid={calendar} />);
    expect(screen.getByText('Mock Meeting')).toBeInTheDocument();
  });
});
```

### **Integration Tests**

- Meeting creation end-to-end flow
- Conflict detection accuracy
- Calendar navigation functionality
- Modal interactions

---

## 🚀 Deployment Checklist

### **Pre-deployment**

- [ ] All utility functions tested
- [ ] Component integration tested
- [ ] Mobile responsiveness verified
- [ ] JST timezone functionality confirmed
- [ ] GraphQL queries optimized
- [ ] Performance benchmarks met

### **Production Considerations**

- CDN for calendar assets
- Database indexing for meeting queries
- Caching strategy for frequently accessed data
- Error monitoring and logging
- User analytics for meeting usage patterns

---

## 📋 Current Implementation Status

### ✅ **Completed**

- [x] Meeting Templates (Calendar, Dashboard, Detail)
- [x] Calendar Utilities (grid generation, navigation, formatting)
- [x] Meeting Utilities (conflict detection, validation, formatting)
- [x] Type Definitions (complete TypeScript coverage)
- [x] JST Timezone Integration (formatJST, formatJSTTime)
- [x] ReactSelectField Component (multi-select attendees)
- [x] Meeting Creation Page (basic form)
- [x] Template SCSS (responsive styling)

### 🔄 **In Progress**

- [ ] Calendar Organism Component
- [ ] Meeting Modal Components
- [ ] GraphQL Query Enhancements

### 📋 **Planned**

- [ ] Calendar Page Implementation
- [ ] Dashboard Page Implementation
- [ ] Meeting Edit Page
- [ ] Meeting Detail Page
- [ ] Advanced Filtering
- [ ] Email Notifications
- [ ] Recurring Meetings
- [ ] Meeting Search
- [ ] Export Functionality

---

## 🎯 Next Steps

1. **Calendar Organism** - Build the main calendar grid component
2. **Meeting Modals** - Create quick-create and details modals
3. **Page Implementation** - Build calendar and dashboard pages using templates
4. **GraphQL Enhancement** - Add missing queries and mutations
5. **Testing** - Add comprehensive test coverage
6. **Polish** - Add animations, loading states, error boundaries

---

## 📞 Integration Points

### **Existing Components Used**

- `ReactSelectField` - For attendee multi-select
- `Modal` - For meeting creation/details
- `Card` - For meeting display
- `Table` - For meeting lists
- `Button`, `TextField`, `TextareaField` - Form components
- `Header`, `Footer` - Layout components

### **Existing Utilities Used**

- `date.ts` - JST timezone formatting
- `component.ts` - Class name building
- `validation.ts` - Form validation (Zod schemas)

### **GraphQL Integration**

- Extends existing Apollo Client setup
- Uses existing authentication context
- Leverages existing user management
- Follows existing error handling patterns

---

This implementation provides a solid foundation for a comprehensive meeting scheduler while maintaining consistency with existing codebase patterns and leveraging established utilities and components.
