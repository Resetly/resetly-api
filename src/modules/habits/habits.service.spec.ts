import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HabitsService } from './habits.service';
import { DRIZZLE_CLIENT } from '../../database/database.module';

describe('HabitsService', () => {
  let service: HabitsService;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      where: jest.fn().mockImplementation(() => ({
        returning: mockDb.returning,
        then: (resolve: any, reject: any) => mockDb.whereResult?.then(resolve, reject),
      })),
      whereResult: Promise.resolve([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HabitsService,
        {
          provide: DRIZZLE_CLIENT,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<HabitsService>(HabitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a habit attached to the given userId', async () => {
      const habitRecord = {
        id: '11111111-1111-1111-1111-111111111111',
        userId: 'user-1',
        name: 'Screen Time Reduction',
        description: 'Limit evening scrolling',
        category: 'Digital Wellness',
        createdAt: '2026-11-01T08:00:00.000Z',
        updatedAt: '2026-11-01T08:00:00.000Z',
      };
      mockDb.returning.mockResolvedValueOnce([habitRecord]);

      const result = await service.create('user-1', {
        name: 'Screen Time Reduction',
        description: 'Limit evening scrolling',
        category: 'Digital Wellness',
      });

      expect(result).toEqual(habitRecord);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          name: 'Screen Time Reduction',
        }),
      );
    });
  });

  describe('findAll', () => {
    it('returns all habits for the given userId', async () => {
      const records = [{ id: '1', userId: 'user-1', name: 'Habit 1', category: 'Health' }];
      mockDb.whereResult = Promise.resolve(records);

      const result = await service.findAll('user-1');
      expect(result).toEqual(records);
    });
  });

  describe('findById', () => {
    it('returns habit when found for the given userId', async () => {
      const record = { id: 'habit-1', userId: 'user-1', name: 'Exercise', category: 'Health' };
      mockDb.whereResult = Promise.resolve([record]);

      const result = await service.findById('user-1', 'habit-1');
      expect(result).toEqual(record);
    });

    it('throws NotFoundException when habit does not exist or belongs to another user', async () => {
      mockDb.whereResult = Promise.resolve([]);

      await expect(service.findById('user-other', 'habit-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates habit when belonging to the given userId', async () => {
      const updatedRecord = {
        id: 'habit-1',
        userId: 'user-1',
        name: 'Updated Name',
        category: 'Health',
      };
      mockDb.returning.mockResolvedValueOnce([updatedRecord]);

      const result = await service.update('user-1', 'habit-1', { name: 'Updated Name' });
      expect(result).toEqual(updatedRecord);
    });

    it('throws NotFoundException when updating non-existent or foreign habit', async () => {
      mockDb.returning.mockResolvedValueOnce([]);

      await expect(
        service.update('user-1', 'habit-not-found', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes habit when belonging to the given userId', async () => {
      const deletedRecord = { id: 'habit-1', userId: 'user-1' };
      mockDb.returning.mockResolvedValueOnce([deletedRecord]);

      await expect(service.delete('user-1', 'habit-1')).resolves.toBeUndefined();
    });

    it('throws NotFoundException when deleting non-existent or foreign habit', async () => {
      mockDb.returning.mockResolvedValueOnce([]);

      await expect(service.delete('user-1', 'habit-not-found')).rejects.toThrow(NotFoundException);
    });
  });
});
