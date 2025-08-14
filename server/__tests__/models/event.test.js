/**
 * Event Model Tests
 * Tests for Mongoose Event schema validation, methods, and database operations
 */

const mongoose = require('mongoose');
const Event = require('../../models/event-schema');
const User = require('../../models/user-schema');
const { connectTestDB, clearTestDB, disconnectTestDB } = require('../../tests/setup/testDb');
const { createTestUser, hashPassword } = require('../../tests/setup/helpers');

describe('Event Model', () => {
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

    beforeEach(async () => {
      // Create test user for reference
      createdBy = new User({
        name: 'Event Creator',
        email: 'creator@example.com',
        password: await hashPassword('password123'),
      });
      await createdBy.save();
    });

    test('should create a valid event', async () => {
      const eventData = {
        title: 'Tech Conference 2024',
        description: 'Annual technology conference with industry experts',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 99.99,
        createdBy: createdBy._id,
      };

      const event = new Event(eventData);
      const savedEvent = await event.save();

      expect(savedEvent._id).toBeDefined();
      expect(savedEvent.title).toBe('Tech Conference 2024');
      expect(savedEvent.description).toBe('Annual technology conference with industry experts');
      expect(savedEvent.date).toEqual(new Date('2024-12-25T09:00:00Z'));
      expect(savedEvent.price).toBe(99.99);
      expect(savedEvent.createdBy.toString()).toBe(createdBy._id.toString());
      expect(savedEvent.createdAt).toBeDefined();
      expect(savedEvent.updatedAt).toBeDefined();
    });

    test('should require title field', async () => {
      const event = new Event({
        description: 'Event without title',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 50.0,
        createdBy: createdBy._id,
      });

      await expect(event.save()).rejects.toThrow(/title.*required/i);
    });

    test('should require date field', async () => {
      const event = new Event({
        title: 'Event without date',
        description: 'This event has no date',
        price: 50.0,
        createdBy: createdBy._id,
      });

      await expect(event.save()).rejects.toThrow(/date.*required/i);
    });

    test('should require price field', async () => {
      const event = new Event({
        title: 'Event without price',
        description: 'This event has no price',
        date: new Date('2024-12-25T09:00:00Z'),
        createdBy: createdBy._id,
      });

      await expect(event.save()).rejects.toThrow(/price.*required/i);
    });

    test('should require createdBy field', async () => {
      const event = new Event({
        title: 'Event without creator',
        description: 'This event has no creator',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 50.0,
      });

      await expect(event.save()).rejects.toThrow(/createdBy.*required/i);
    });

    test('should trim title field', async () => {
      const event = new Event({
        title: '  Conference 2024  ',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 99.99,
        createdBy: createdBy._id,
      });

      const savedEvent = await event.save();
      expect(savedEvent.title).toBe('Conference 2024');
    });

    test('should set default empty description', async () => {
      const event = new Event({
        title: 'Event without description',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 50.0,
        createdBy: createdBy._id,
      });

      const savedEvent = await event.save();
      expect(savedEvent.description).toBe('');
    });

    test('should validate price as number', async () => {
      const event = new Event({
        title: 'Event with invalid price',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 'not-a-number',
        createdBy: createdBy._id,
      });

      await expect(event.save()).rejects.toThrow(/Cast to Number failed/i);
    });

    test('should validate createdBy ObjectId', async () => {
      const event = new Event({
        title: 'Event with invalid creator',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 50.0,
        createdBy: 'invalid-object-id',
      });

      await expect(event.save()).rejects.toThrow(/Cast to ObjectId failed/i);
    });

    test('should accept zero price', async () => {
      const event = new Event({
        title: 'Free Event',
        description: 'This is a free event',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 0,
        createdBy: createdBy._id,
      });

      const savedEvent = await event.save();
      expect(savedEvent.price).toBe(0);
    });

    test('should accept negative price (discount scenario)', async () => {
      const event = new Event({
        title: 'Discount Event',
        description: 'Event with discount',
        date: new Date('2024-12-25T09:00:00Z'),
        price: -10.99,
        createdBy: createdBy._id,
      });

      const savedEvent = await event.save();
      expect(savedEvent.price).toBe(-10.99);
    });

    test('should handle decimal prices correctly', async () => {
      const event = new Event({
        title: 'Decimal Price Event',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 123.456,
        createdBy: createdBy._id,
      });

      const savedEvent = await event.save();
      expect(savedEvent.price).toBe(123.456);
    });
  });

  describe('Population and References', () => {
    let createdBy;
    let event;

    beforeEach(async () => {
      // Create test data
      createdBy = await new User({
        name: 'Event Creator',
        email: 'creator@example.com',
        password: await hashPassword('password123'),
      }).save();

      event = await new Event({
        title: 'Test Event',
        description: 'Test event description',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 75.5,
        createdBy: createdBy._id,
      }).save();
    });

    test('should populate createdBy user', async () => {
      const populatedEvent = await Event.findById(event._id).populate('createdBy');

      expect(populatedEvent.createdBy).toBeDefined();
      expect(populatedEvent.createdBy.name).toBe('Event Creator');
      expect(populatedEvent.createdBy.email).toBe('creator@example.com');
    });

    test('should select specific fields when populating', async () => {
      const populatedEvent = await Event.findById(event._id).populate('createdBy', 'name email');

      expect(populatedEvent.createdBy.name).toBe('Event Creator');
      expect(populatedEvent.createdBy.email).toBe('creator@example.com');
      expect(populatedEvent.createdBy.password).toBeUndefined(); // Should not be populated
    });
  });

  describe('Database Operations', () => {
    let createdBy;

    beforeEach(async () => {
      createdBy = await new User({
        name: 'Event Creator',
        email: 'creator@example.com',
        password: await hashPassword('password123'),
      }).save();
    });

    test('should find event by title', async () => {
      const eventData = {
        title: 'Unique Event Title',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 100.0,
        createdBy: createdBy._id,
      };

      await new Event(eventData).save();
      const foundEvent = await Event.findOne({ title: 'Unique Event Title' });

      expect(foundEvent).toBeTruthy();
      expect(foundEvent.title).toBe('Unique Event Title');
    });

    test('should find events by creator', async () => {
      const event1 = new Event({
        title: 'Event 1',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 50.0,
        createdBy: createdBy._id,
      });

      const event2 = new Event({
        title: 'Event 2',
        date: new Date('2024-12-26T09:00:00Z'),
        price: 75.0,
        createdBy: createdBy._id,
      });

      await event1.save();
      await event2.save();

      const creatorEvents = await Event.find({ createdBy: createdBy._id });
      expect(creatorEvents).toHaveLength(2);
    });

    test('should find events by price range', async () => {
      await new Event({
        title: 'Cheap Event',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 25.0,
        createdBy: createdBy._id,
      }).save();

      await new Event({
        title: 'Expensive Event',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 150.0,
        createdBy: createdBy._id,
      }).save();

      const affordableEvents = await Event.find({
        price: { $lte: 50.0 },
      });

      expect(affordableEvents).toHaveLength(1);
      expect(affordableEvents[0].title).toBe('Cheap Event');
    });

    test('should update event data', async () => {
      const event = new Event({
        title: 'Original Event',
        description: 'Original description',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 100.0,
        createdBy: createdBy._id,
      });

      const savedEvent = await event.save();

      savedEvent.title = 'Updated Event';
      savedEvent.price = 150.0;

      const updatedEvent = await savedEvent.save();

      expect(updatedEvent.title).toBe('Updated Event');
      expect(updatedEvent.price).toBe(150.0);
      expect(updatedEvent.updatedAt).not.toEqual(updatedEvent.createdAt);
    });

    test('should delete event', async () => {
      const event = new Event({
        title: 'Event to Delete',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 50.0,
        createdBy: createdBy._id,
      });

      const savedEvent = await event.save();
      const eventId = savedEvent._id;

      await Event.findByIdAndDelete(eventId);

      const deletedEvent = await Event.findById(eventId);
      expect(deletedEvent).toBeNull();
    });

    test('should find events by date range', async () => {
      await new Event({
        title: 'December Event',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 50.0,
        createdBy: createdBy._id,
      }).save();

      await new Event({
        title: 'January Event',
        date: new Date('2025-01-15T09:00:00Z'),
        price: 75.0,
        createdBy: createdBy._id,
      }).save();

      // Find events in December 2024
      const decemberEvents = await Event.find({
        date: {
          $gte: new Date('2024-12-01T00:00:00Z'),
          $lt: new Date('2025-01-01T00:00:00Z'),
        },
      });

      expect(decemberEvents).toHaveLength(1);
      expect(decemberEvents[0].title).toBe('December Event');
    });

    test('should sort events by date ascending', async () => {
      await new Event({
        title: 'Later Event',
        date: new Date('2024-12-26T09:00:00Z'),
        price: 50.0,
        createdBy: createdBy._id,
      }).save();

      await new Event({
        title: 'Earlier Event',
        date: new Date('2024-12-24T09:00:00Z'),
        price: 50.0,
        createdBy: createdBy._id,
      }).save();

      const sortedEvents = await Event.find({}).sort({ date: 1 });

      expect(sortedEvents).toHaveLength(2);
      expect(sortedEvents[0].title).toBe('Earlier Event');
      expect(sortedEvents[1].title).toBe('Later Event');
    });
  });
});
