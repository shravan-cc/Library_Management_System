import { describe, beforeEach, test, expect } from 'vitest';
import { MemberRepository } from './member.repository';
import { IMember, IMemberBase } from './models/member.model';
import { Database } from '../db/db';
import { LibraryDataset } from '../db/library-dataset';
import { LibraryInteractor } from '../library-interactor';

describe('Tests for MemberRepository class methods', () => {
  let memberRepository: MemberRepository;
  let data: IMemberBase;
  let db: Database<LibraryDataset>;

  beforeAll(async () => {
    db = new Database('./data/dbtest.json');
    await db.clear();
  });
  beforeEach(async () => {
    memberRepository = new MemberRepository(db);
    data = {
      address: 'Mangalore',
      firstName: 'Shravan',
      lastName: 'Hegde',
      phone: 8792225251,
    };
  });

  test('Tests for creating member', async () => {
    const createdMember = await memberRepository.create(data);
    expect(createdMember).toEqual({
      ...data,
      memberId: 1,
    });

    expect(createdMember).toBeDefined();
  });

  test('Tests for deleting member', async () => {
    const createdMember = await memberRepository.create(data);
    const deletedMember = await memberRepository.delete(createdMember.memberId);
    expect(deletedMember).toEqual(createdMember);
  });

  test('Tests for updating member', async () => {
    const createdMember = await memberRepository.create(data);

    const updatedData: IMemberBase = {
      address: 'Udupi',
      firstName: 'Shravan Kumar',
      lastName: 'Hegde',
      phone: 8792225251,
    };

    const updatedMember = await memberRepository.update(
      createdMember.memberId,
      updatedData
    );
    expect(updatedMember).toEqual({
      ...updatedData,
      memberId: createdMember.memberId,
    });
  });

  test('Tests for getting member by ID', async () => {
    const createdMember = await memberRepository.create(data);

    const retrievedMember = await memberRepository.getById(
      createdMember.memberId
    );
    expect(retrievedMember).toEqual(createdMember);
  });

  test('Tests for listing members', async () => {
    const data1: IMemberBase = {
      address: 'Mangalore',
      firstName: 'Preethesh',
      lastName: 'Devadiga',
      phone: 8792225251,
    };

    const data2: IMemberBase = {
      address: 'Mangalore',
      firstName: 'Vignesh',
      lastName: 'H',
      phone: 9632483331,
    };

    const createdMember1 = await memberRepository.create(data1);
    const createdMember2 = await memberRepository.create(data2);

    const result = await memberRepository.list({
      offset: 0,
      limit: 10,
      search: '',
    });

    expect(result.pagination.total).toBe(5);
  });
});
