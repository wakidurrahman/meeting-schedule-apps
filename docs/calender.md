# Looking at your hand-written wireframe, Google Calendar screenshots, existing components, and requirements, I'll create a comprehensive implementation plan for the meeting scheduler app.

## 📋 **Analysis of Current State**

### **✅ Existing Components & Pages**

- `CREATE_MEETING` mutation and basic form in `/pages/meeting/create/index.tsx`
- `ReactSelectField` component for multi-select attendees
- `Modal` component for popup interfaces
- `BaseTemplate`, `Card`, `Table`, `Pagination` components
- GraphQL structure with user queries
- Authentication context

### **❌ Missing Components**

- Calendar grid/view component
- Meeting detail view modal
- Meeting list dashboard
- Time slot conflict checking
- Calendar navigation controls
- Meeting quick-create modal

---

## 🎯 **Complete Implementation Plan**

### **Phase 1: Core Calendar Infrastructure**

#### **1.1 New Utility Functions** (`/utils/`)

```typescript
// /utils/calendar.ts
-generateCalendarGrid() -
  isTimeSlotAvailable() -
  formatMeetingTime() -
  getMeetingsByDateRange() -
  checkMeetingConflicts() -
  // /utils/meeting.ts
  calculateMeetingDuration() -
  validateMeetingTime() -
  formatAttendeeList() -
  optimisticMeetingUpdate();
```

#### **1.2 New Types** (`/types/`)

```typescript
// /types/calendar.ts
- CalendarViewType ('month' | 'week' | 'day')
- TimeSlot interface
- CalendarEvent interface
- MeetingConflict interface
```

### **Phase 2: Calendar Components**

#### **2.1 Calendar Organism** (`/components/organisms/calendar/`)

```
calendar/
├── index.tsx              # Main Calendar component
├── CalendarGrid.tsx       # Month/week/day grid
├── CalendarHeader.tsx     # Navigation & controls
├── CalendarEvent.tsx      # Individual event display
└── CalendarDatePicker.tsx # Date selection
```

#### **2.2 Meeting Components** (`/components/molecules/meeting/`)

```
meeting/
├── MeetingCard.tsx        # Meeting summary card
├── MeetingList.tsx        # List of meetings
├── MeetingModal.tsx       # Meeting details modal
├── QuickCreateModal.tsx   # Quick meeting creation
└── AttendeeSelector.tsx   # Multi-user selection
```

### **Phase 3: Page Structure**

#### **3.1 Calendar Page** (`/pages/calendar/index.tsx`)

- Full calendar view with navigation
- Meeting creation via modal
- Meeting view via modal
- Filter controls (Day/Week/Month/Year)

#### **3.2 Dashboard Page** (`/pages/dashboard/index.tsx`)

- User's meeting list
- Quick stats
- Upcoming meetings widget

#### **3.3 Meeting Pages**

```
/pages/meeting/
├── create/index.tsx       # ✅ EXISTS (convert to modal)
├── edit/[id]/index.tsx    # Individual edit page
├── [id]/index.tsx         # Meeting details page
└── index.tsx              # Meeting management page
```

---

## 🏗️ **Detailed Implementation Roadmap**

### **🎯 Phase 1: Backend & Utilities (Week 1)**

1. **GraphQL Enhancements**

   - `GET_MEETINGS_BY_DATE_RANGE` query
   - `UPDATE_MEETING` mutation
   - `DELETE_MEETING` mutation
   - Meeting conflict validation resolvers

2. **Utility Functions**
   ```typescript
   // Key utilities needed
   generateCalendarGrid(year, month, meetings);
   checkTimeConflicts(newMeeting, existingMeetings);
   formatMeetingTimeRange(start, end);
   validateMeetingForm(data);
   ```

### **🎯 Phase 2: Calendar Core (Week 2)**

1. **Calendar Organism Components**

   ```jsx
   <Calendar
     view="month" | "week" | "day"
     selectedDate={date}
     meetings={meetings}
     onCreateMeeting={openModal}
     onSelectMeeting={openDetailsModal}
   />
   ```

2. **Calendar Grid Component**
   - Responsive grid layout
   - Event placement logic
   - Click handlers for date selection
   - Meeting overflow handling

### **🎯 Phase 3: Modal System (Week 3)**

1. **Meeting Creation Modal**

   ```jsx
   <QuickCreateModal
     show={showCreate}
     onHide={() => setShowCreate(false)}
     selectedDate={selectedDate}
     availableUsers={users}
   />
   ```

2. **Meeting Details Modal**
   ```jsx
   <MeetingDetailsModal
     meeting={selectedMeeting}
     show={showDetails}
     onEdit={handleEdit}
     onDelete={handleDelete}
   />
   ```

### **🎯 Phase 4: Enhanced UX (Week 4)**

1. **Attendee Management**

   - Use existing `ReactSelectField` for multi-select
   - Real-time availability checking
   - Conflict warnings

2. **Optimistic Updates**
   - Apollo cache updates
   - Loading states
   - Error rollback

---

## 🧩 **New Components Needed**

### **Required New Components:**

1. **📅 Calendar Organism**

   ```
   Calendar/
   ├── CalendarGrid.tsx       # Main calendar grid
   ├── CalendarHeader.tsx     # Month navigation
   ├── CalendarEvent.tsx      # Event display chip
   ├── TimeSlotPicker.tsx     # Time selection
   └── EventPopover.tsx       # Quick event preview
   ```

2. **🏢 Meeting Molecules**

   ```
   Meeting/
   ├── MeetingCard.tsx        # Meeting summary
   ├── AttendeeChips.tsx      # Attendee display
   ├── ConflictWarning.tsx    # Time conflict alert
   ├── MeetingStatus.tsx      # Meeting status badge
   └── TimeDisplay.tsx        # Formatted time ranges
   ```

3. **📱 Modal Templates**
   ```
   Modals/
   ├── CreateMeetingModal.tsx  # Quick create
   ├── MeetingDetailsModal.tsx # Full meeting view
   └── EditMeetingModal.tsx    # Edit form modal
   ```

### **Enhanced Existing Components:**

1. **Extend ReactSelectField**

   - Add user avatar display
   - Availability status indicators
   - Search by email/name

2. **Enhance Modal**
   - Size variants for meeting forms
   - Better keyboard navigation

---

## 🎨 **UI/UX Implementation Plan**

### **Calendar Interface:**

```jsx
// Main calendar page structure
<BaseTemplate>
  <CalendarHeader
    currentDate={currentDate}
    view={view}
    onViewChange={setView}
    onCreateClick={() => setShowCreate(true)}
  />
  <CalendarGrid
    meetings={meetings}
    selectedDate={selectedDate}
    onDateClick={handleDateClick}
    onMeetingClick={handleMeetingClick}
  />

  {/* Modals */}
  <QuickCreateModal {...createProps} />
  <MeetingDetailsModal {...detailProps} />
</BaseTemplate>
```

### **Meeting Creation Flow:**

1. **Calendar Date Click** → Quick Create Modal opens
2. **+ Create Button** → Full Create Modal opens
3. **Form Validation** → Real-time conflict checking
4. **Submit** → Optimistic update + Navigate/Close

### **Meeting Management Flow:**

1. **Meeting Click** → Details Modal opens
2. **Edit Button** → Navigate to edit page
3. **Delete Button** → Confirmation modal
4. **Dashboard** → Table of user's meetings

---

## 📊 **Implementation Priority Matrix**

### **🔥 Critical (Week 1-2)**

- [ ] Calendar grid component
- [ ] Meeting creation modal
- [ ] Basic GraphQL queries
- [ ] Time conflict checking

### **⚡ Important (Week 3)**

- [ ] Meeting details modal
- [ ] Calendar navigation
- [ ] Attendee multi-select
- [ ] Meeting edit page

### **✨ Enhanced (Week 4)**

- [ ] Dashboard view
- [ ] Optimistic updates
- [ ] Advanced filtering
- [ ] Meeting search

---

**🤔 Questions for You:**

1. Should we support recurring meetings in this phase?
2. Do you want email notifications for meeting invites?
3. Should meetings support external (non-registered) attendees?
4. Any specific timezone handling requirements?
5. Should we implement meeting rooms/location booking?

This plan leverages your existing components while building a comprehensive meeting scheduler. The modal-based creation and viewing aligns with your wireframe, and the individual edit page provides detailed management capabilities.

Ready to proceed with implementation once you approve this plan! 🚀

🎯 Ready for Implementation Commands
With this foundation, you can now:
Create Calendar Pages using the new templates
Build Meeting Modals with conflict detection
Implement Dashboard with meeting management
Add GraphQL Integration with existing utilities
The templates are specifically designed for meeting functionality and avoid BaseTemplate as requested. Each template has responsive layouts, proper SCSS styling, and specialized areas for calendar/meeting content.
Ready to proceed with the Calendar organism component or would you like to see any specific part implemented first? 🚀
