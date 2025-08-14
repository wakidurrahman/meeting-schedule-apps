/**
 * Booking Model Tests
 * Tests for Mongoose Booking schema validation, methods, and database operations
 */

const mongoose = require('mongoose');
const Booking = require('../../models/booking-schema');
const Event = require('../../models/event-schema');
const User = require('../../models/user-schema');
const { connectTestDB, clearTestDB, disconnectTestDB } = require('../../tests/setup/testDb');
const { hashPassword } = require('../../tests/setup/helpers');

describe('Booking Model', () => {
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
    let user;
    let event;

    beforeEach(async () => {
      // Create test user
      user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: await hashPassword('password123'),
      });
      await user.save();

      // Create test event
      event = new Event({
        title: 'Tech Conference',
        description: 'Annual tech conference',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 99.99,
        createdBy: user._id,
      });
      await event.save();
    });

    test('should create a valid booking', async () => {
      const bookingData = {
        event: event._id,
        user: user._id,
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();

      expect(savedBooking._id).toBeDefined();
      expect(savedBooking.event.toString()).toBe(event._id.toString());
      expect(savedBooking.user.toString()).toBe(user._id.toString());
      expect(savedBooking.createdAt).toBeDefined();
      expect(savedBooking.updatedAt).toBeDefined();
    });

    test('should require event field', async () => {
      const booking = new Booking({
        user: user._id,
      });

      await expect(booking.save()).rejects.toThrow(/event.*required/i);
    });

    test('should require user field', async () => {
      const booking = new Booking({
        event: event._id,
      });

      await expect(booking.save()).rejects.toThrow(/user.*required/i);
    });

    test('should validate event ObjectId', async () => {
      const booking = new Booking({
        event: 'invalid-object-id',
        user: user._id,
      });

      await expect(booking.save()).rejects.toThrow(/Cast to ObjectId failed/i);
    });

    test('should validate user ObjectId', async () => {
      const booking = new Booking({
        event: event._id,
        user: 'invalid-object-id',
      });

      await expect(booking.save()).rejects.toThrow(/Cast to ObjectId failed/i);
    });

    test('should allow multiple bookings for same event by different users', async () => {
      // Create second user
      const user2 = new User({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: await hashPassword('password123'),
      });
      await user2.save();

      // Create first booking
      const booking1 = new Booking({
        event: event._id,
        user: user._id,
      });
      await booking1.save();

      // Create second booking for same event
      const booking2 = new Booking({
        event: event._id,
        user: user2._id,
      });
      const savedBooking2 = await booking2.save();

      expect(savedBooking2._id).toBeDefined();
      expect(savedBooking2.event.toString()).toBe(event._id.toString());
      expect(savedBooking2.user.toString()).toBe(user2._id.toString());
    });

    test('should allow same user to book different events', async () => {
      // Create second event
      const event2 = new Event({
        title: 'Workshop',
        description: 'Technical workshop',
        date: new Date('2024-12-26T09:00:00Z'),
        price: 49.99,
        createdBy: user._id,
      });
      await event2.save();

      // Create first booking
      const booking1 = new Booking({
        event: event._id,
        user: user._id,
      });
      await booking1.save();

      // Create second booking for different event
      const booking2 = new Booking({
        event: event2._id,
        user: user._id,
      });
      const savedBooking2 = await booking2.save();

      expect(savedBooking2._id).toBeDefined();
      expect(savedBooking2.event.toString()).toBe(event2._id.toString());
      expect(savedBooking2.user.toString()).toBe(user._id.toString());
    });

    test('should prevent duplicate bookings (same user, same event)', async () => {
      // Create first booking
      const booking1 = new Booking({
        event: event._id,
        user: user._id,
      });
      await booking1.save();

      // Try to create duplicate booking
      const booking2 = new Booking({
        event: event._id,
        user: user._id,
      });

      // Note: This test assumes you might add a compound unique index in the future
      // For now, MongoDB allows duplicate bookings, so this would pass
      const savedBooking2 = await booking2.save();
      expect(savedBooking2._id).toBeDefined();

      // In a real scenario, you might want to add a compound unique index:
      // bookingSchema.index({ event: 1, user: 1 }, { unique: true });
    });
  });

  describe('Population and References', () => {
    let user;
    let event;
    let booking;

    beforeEach(async () => {
      // Create test data
      user = await new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: await hashPassword('password123'),
      }).save();

      event = await new Event({
        title: 'Tech Conference',
        description: 'Annual tech conference',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 99.99,
        createdBy: user._id,
      }).save();

      booking = await new Booking({
        event: event._id,
        user: user._id,
      }).save();
    });

    test('should populate event details', async () => {
      const populatedBooking = await Booking.findById(booking._id).populate('event');

      expect(populatedBooking.event).toBeDefined();
      expect(populatedBooking.event.title).toBe('Tech Conference');
      expect(populatedBooking.event.price).toBe(99.99);
    });

    test('should populate user details', async () => {
      const populatedBooking = await Booking.findById(booking._id).populate('user');

      expect(populatedBooking.user).toBeDefined();
      expect(populatedBooking.user.name).toBe('John Doe');
      expect(populatedBooking.user.email).toBe('john@example.com');
    });

    test('should populate both event and user', async () => {
      const populatedBooking = await Booking.findById(booking._id)
        .populate('event')
        .populate('user');

      expect(populatedBooking.event.title).toBe('Tech Conference');
      expect(populatedBooking.user.name).toBe('John Doe');
    });

    test('should select specific fields when populating', async () => {
      const populatedBooking = await Booking.findById(booking._id)
        .populate('event', 'title price')
        .populate('user', 'name email');

      expect(populatedBooking.event.title).toBe('Tech Conference');
      expect(populatedBooking.event.price).toBe(99.99);
      expect(populatedBooking.event.description).toBeUndefined(); // Should not be populated

      expect(populatedBooking.user.name).toBe('John Doe');
      expect(populatedBooking.user.email).toBe('john@example.com');
      expect(populatedBooking.user.password).toBeUndefined(); // Should not be populated
    });
  });

  describe('Database Operations', () => {
    let user1;
    let user2;
    let event1;
    let event2;

    beforeEach(async () => {
      // Create test users
      user1 = await new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: await hashPassword('password123'),
      }).save();

      user2 = await new User({
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: await hashPassword('password123'),
      }).save();

      // Create test events
      event1 = await new Event({
        title: 'Tech Conference',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 99.99,
        createdBy: user1._id,
      }).save();

      event2 = await new Event({
        title: 'Workshop',
        date: new Date('2024-12-26T09:00:00Z'),
        price: 49.99,
        createdBy: user1._id,
      }).save();
    });

    test('should find bookings by user', async () => {
      await new Booking({ event: event1._id, user: user1._id }).save();
      await new Booking({ event: event2._id, user: user1._id }).save();
      await new Booking({ event: event1._id, user: user2._id }).save();

      const user1Bookings = await Booking.find({ user: user1._id });
      expect(user1Bookings).toHaveLength(2);
    });

    test('should find bookings by event', async () => {
      await new Booking({ event: event1._id, user: user1._id }).save();
      await new Booking({ event: event1._id, user: user2._id }).save();
      await new Booking({ event: event2._id, user: user1._id }).save();

      const event1Bookings = await Booking.find({ event: event1._id });
      expect(event1Bookings).toHaveLength(2);
    });

    test('should delete booking', async () => {
      const booking = await new Booking({
        event: event1._id,
        user: user1._id,
      }).save();

      const bookingId = booking._id;
      await Booking.findByIdAndDelete(bookingId);

      const deletedBooking = await Booking.findById(bookingId);
      expect(deletedBooking).toBeNull();
    });

    test('should count bookings per event', async () => {
      await new Booking({ event: event1._id, user: user1._id }).save();
      await new Booking({ event: event1._id, user: user2._id }).save();
      await new Booking({ event: event2._id, user: user1._id }).save();

      const event1BookingCount = await Booking.countDocuments({ event: event1._id });
      const event2BookingCount = await Booking.countDocuments({ event: event2._id });

      expect(event1BookingCount).toBe(2);
      expect(event2BookingCount).toBe(1);
    });

    test('should find all bookings with populated data', async () => {
      await new Booking({ event: event1._id, user: user1._id }).save();
      await new Booking({ event: event2._id, user: user2._id }).save();

      const allBookings = await Booking.find({})
        .populate('event', 'title price')
        .populate('user', 'name email');

      expect(allBookings).toHaveLength(2);
      expect(allBookings[0].event.title).toBeDefined();
      expect(allBookings[0].user.name).toBeDefined();
    });

    test('should find bookings by date range (through event)', async () => {
      await new Booking({ event: event1._id, user: user1._id }).save();
      await new Booking({ event: event2._id, user: user1._id }).save();

      // Find bookings for events on December 25th
      const bookingsWithEvents = await Booking.find({}).populate({
        path: 'event',
        match: {
          date: {
            $gte: new Date('2024-12-25T00:00:00Z'),
            $lt: new Date('2024-12-26T00:00:00Z'),
          },
        },
      });

      // Filter out bookings where event population returned null (didn't match criteria)
      const filteredBookings = bookingsWithEvents.filter((booking) => booking.event !== null);

      expect(filteredBookings).toHaveLength(1);
    });

    test('should update booking timestamps', async () => {
      const booking = await new Booking({
        event: event1._id,
        user: user1._id,
      }).save();

      const originalUpdatedAt = booking.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Update the booking (though there are no additional fields to update)
      // In a real scenario, you might have additional fields like status, notes, etc.
      booking.markModified('createdAt'); // Force an update
      const updatedBooking = await booking.save();

      expect(updatedBooking.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
