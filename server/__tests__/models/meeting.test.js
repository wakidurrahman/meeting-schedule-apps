/**
 * Meeting Model Tests
 * Tests for Mongoose Meeting schema validation, methods, and database operations
 */

const mongoose = require('mongoose');
const Meeting = require('../../models/meeting-schema');
const User = require('../../models/user-schema');
const { connectTestDB, clearTestDB, disconnectTestDB } = require('../../tests/setup/testDb');
const { createTestUser, hashPassword, generateObjectId } = require('../../tests/setup/helpers');

describe('Meeting Model', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe('Schema Validation', () => {
    let createdBy;
    let attendee1;
    let attendee2;

    beforeEach(async () => {
      // Create test users for references
      createdBy = new User({
        name: 'Meeting Creator',
        email: 'creator@example.com',
        password: await hashPassword('password123'),
      });
      await createdBy.save();

      attendee1 = new User({
        name: 'Attendee One',
        email: 'attendee1@example.com',
        password: await hashPassword('password123'),
      });
      await attendee1.save();

      attendee2 = new User({
        name: 'Attendee Two',
        email: 'attendee2@example.com',
        password: await hashPassword('password123'),
      });
      await attendee2.save();
    });

    test('should create a valid meeting', async () => {
      const meetingData = {
        title: 'Team Stand-up',
        description: 'Daily team synchronization meeting',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
        attendees: [attendee1._id, attendee2._id],
        createdBy: createdBy._id,
      };

      const meeting = new Meeting(meetingData);
      const savedMeeting = await meeting.save();

      expect(savedMeeting._id).toBeDefined();
      expect(savedMeeting.title).toBe('Team Stand-up');
      expect(savedMeeting.description).toBe('Daily team synchronization meeting');
      expect(savedMeeting.startTime).toEqual(new Date('2024-12-25T09:00:00Z'));
      expect(savedMeeting.endTime).toEqual(new Date('2024-12-25T10:00:00Z'));
      expect(savedMeeting.attendees).toHaveLength(2);
      expect(savedMeeting.createdBy.toString()).toBe(createdBy._id.toString());
      expect(savedMeeting.createdAt).toBeDefined();
      expect(savedMeeting.updatedAt).toBeDefined();
    });

    test('should require title field', async () => {
      const meeting = new Meeting({
        description: 'Meeting without title',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
        createdBy: createdBy._id,
      });

      await expect(meeting.save()).rejects.toThrow(/title.*required/i);
    });

    test('should require startTime field', async () => {
      const meeting = new Meeting({
        title: 'Meeting without start time',
        endTime: new Date('2024-12-25T10:00:00Z'),
        createdBy: createdBy._id,
      });

      await expect(meeting.save()).rejects.toThrow(/startTime.*required/i);
    });

    test('should require endTime field', async () => {
      const meeting = new Meeting({
        title: 'Meeting without end time',
        startTime: new Date('2024-12-25T09:00:00Z'),
        createdBy: createdBy._id,
      });

      await expect(meeting.save()).rejects.toThrow(/endTime.*required/i);
    });

    test('should require createdBy field', async () => {
      const meeting = new Meeting({
        title: 'Meeting without creator',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
      });

      await expect(meeting.save()).rejects.toThrow(/createdBy.*required/i);
    });

    test('should trim title field', async () => {
      const meeting = new Meeting({
        title: '  Team Meeting  ',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
        createdBy: createdBy._id,
      });

      const savedMeeting = await meeting.save();
      expect(savedMeeting.title).toBe('Team Meeting');
    });

    test('should set default empty description', async () => {
      const meeting = new Meeting({
        title: 'Meeting without description',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
        createdBy: createdBy._id,
      });

      const savedMeeting = await meeting.save();
      expect(savedMeeting.description).toBe('');
    });

    test('should accept empty attendees array', async () => {
      const meeting = new Meeting({
        title: 'Solo Meeting',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
        attendees: [],
        createdBy: createdBy._id,
      });

      const savedMeeting = await meeting.save();
      expect(savedMeeting.attendees).toEqual([]);
    });

    test('should validate attendee ObjectIds', async () => {
      const meeting = new Meeting({
        title: 'Meeting with invalid attendee',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
        attendees: ['invalid-object-id'],
        createdBy: createdBy._id,
      });

      await expect(meeting.save()).rejects.toThrow(/Cast to ObjectId failed/i);
    });

    test('should validate createdBy ObjectId', async () => {
      const meeting = new Meeting({
        title: 'Meeting with invalid creator',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
        createdBy: 'invalid-object-id',
      });

      await expect(meeting.save()).rejects.toThrow(/Cast to ObjectId failed/i);
    });

    test('should handle duplicate attendees', async () => {
      const meeting = new Meeting({
        title: 'Meeting with duplicate attendees',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
        attendees: [attendee1._id, attendee1._id], // Same attendee twice
        createdBy: createdBy._id,
      });

      const savedMeeting = await meeting.save();
      expect(savedMeeting.attendees).toHaveLength(2); // MongoDB allows duplicates in arrays
    });
  });

  describe('Population and References', () => {
    let createdBy;
    let attendee;
    let meeting;

    beforeEach(async () => {
      // Create test data
      createdBy = await new User({
        name: 'Meeting Creator',
        email: 'creator@example.com',
        password: await hashPassword('password123'),
      }).save();

      attendee = await new User({
        name: 'Meeting Attendee',
        email: 'attendee@example.com',
        password: await hashPassword('password123'),
      }).save();

      meeting = await new Meeting({
        title: 'Test Meeting',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
        attendees: [attendee._id],
        createdBy: createdBy._id,
      }).save();
    });

    test('should populate createdBy user', async () => {
      const populatedMeeting = await Meeting.findById(meeting._id).populate('createdBy');

      expect(populatedMeeting.createdBy).toBeDefined();
      expect(populatedMeeting.createdBy.name).toBe('Meeting Creator');
      expect(populatedMeeting.createdBy.email).toBe('creator@example.com');
    });

    test('should populate attendees users', async () => {
      const populatedMeeting = await Meeting.findById(meeting._id).populate('attendees');

      expect(populatedMeeting.attendees).toHaveLength(1);
      expect(populatedMeeting.attendees[0].name).toBe('Meeting Attendee');
      expect(populatedMeeting.attendees[0].email).toBe('attendee@example.com');
    });

    test('should populate both createdBy and attendees', async () => {
      const populatedMeeting = await Meeting.findById(meeting._id)
        .populate('createdBy')
        .populate('attendees');

      expect(populatedMeeting.createdBy.name).toBe('Meeting Creator');
      expect(populatedMeeting.attendees).toHaveLength(1);
      expect(populatedMeeting.attendees[0].name).toBe('Meeting Attendee');
    });
  });

  describe('Database Operations', () => {
    let createdBy;

    beforeEach(async () => {
      createdBy = await new User({
        name: 'Meeting Creator',
        email: 'creator@example.com',
        password: await hashPassword('password123'),
      }).save();
    });

    test('should find meeting by title', async () => {
      const meetingData = {
        title: 'Unique Meeting Title',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
        createdBy: createdBy._id,
      };

      await new Meeting(meetingData).save();
      const foundMeeting = await Meeting.findOne({ title: 'Unique Meeting Title' });

      expect(foundMeeting).toBeTruthy();
      expect(foundMeeting.title).toBe('Unique Meeting Title');
    });

    test('should find meetings by creator', async () => {
      const meeting1 = new Meeting({
        title: 'Meeting 1',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
        createdBy: createdBy._id,
      });

      const meeting2 = new Meeting({
        title: 'Meeting 2',
        startTime: new Date('2024-12-25T11:00:00Z'),
        endTime: new Date('2024-12-25T12:00:00Z'),
        createdBy: createdBy._id,
      });

      await meeting1.save();
      await meeting2.save();

      const creatorMeetings = await Meeting.find({ createdBy: createdBy._id });
      expect(creatorMeetings).toHaveLength(2);
    });

    test('should update meeting data', async () => {
      const meeting = new Meeting({
        title: 'Original Title',
        description: 'Original description',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
        createdBy: createdBy._id,
      });

      const savedMeeting = await meeting.save();

      savedMeeting.title = 'Updated Title';
      savedMeeting.description = 'Updated description';

      const updatedMeeting = await savedMeeting.save();

      expect(updatedMeeting.title).toBe('Updated Title');
      expect(updatedMeeting.description).toBe('Updated description');
      expect(updatedMeeting.updatedAt).not.toEqual(updatedMeeting.createdAt);
    });

    test('should delete meeting', async () => {
      const meeting = new Meeting({
        title: 'Meeting to Delete',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
        createdBy: createdBy._id,
      });

      const savedMeeting = await meeting.save();
      const meetingId = savedMeeting._id;

      await Meeting.findByIdAndDelete(meetingId);

      const deletedMeeting = await Meeting.findById(meetingId);
      expect(deletedMeeting).toBeNull();
    });

    test('should find meetings by date range', async () => {
      const meeting1 = await new Meeting({
        title: 'Morning Meeting',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
        createdBy: createdBy._id,
      }).save();

      const meeting2 = await new Meeting({
        title: 'Afternoon Meeting',
        startTime: new Date('2024-12-25T14:00:00Z'),
        endTime: new Date('2024-12-25T15:00:00Z'),
        createdBy: createdBy._id,
      }).save();

      const meeting3 = await new Meeting({
        title: 'Next Day Meeting',
        startTime: new Date('2024-12-26T09:00:00Z'),
        endTime: new Date('2024-12-26T10:00:00Z'),
        createdBy: createdBy._id,
      }).save();

      // Find meetings on December 25th
      const todayMeetings = await Meeting.find({
        startTime: {
          $gte: new Date('2024-12-25T00:00:00Z'),
          $lt: new Date('2024-12-26T00:00:00Z'),
        },
      });

      expect(todayMeetings).toHaveLength(2);
      expect(todayMeetings.map((m) => m.title)).toContain('Morning Meeting');
      expect(todayMeetings.map((m) => m.title)).toContain('Afternoon Meeting');
    });
  });
});
