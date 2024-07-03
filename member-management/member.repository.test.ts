import { describe, beforeEach, test, expect } from 'vitest';
import { MemberRepository } from './member.repository';
import { IMember, IMemberBase } from './models/member.model';

describe('Tests for MemberRepository class methods', () => {
  let memberRepository: MemberRepository;
  let data: IMemberBase;
  beforeEach(() => {
    memberRepository = new MemberRepository();
    data = {
      address: 'Mangalore',
      firstName: 'Shravan',
      lastName: 'Hegde',
      phone: 8792225251,
    };
  });

  test('Tests for creating member', () => {
    const createdMember = memberRepository.create(data);
    expect(createdMember).toEqual({
      ...data,
      memberId: 1,
    });

    expect(memberRepository.create(data)).toBeDefined();
  });

  test('Tests for deleting member', () => {
    const createdMember = memberRepository.create(data);
    expect(memberRepository.delete(createdMember.memberId)).toEqual(
      createdMember
    );
  });

  test('Tests for updating member', () => {
    const createdMember = memberRepository.create(data);

    const updatedData: IMemberBase = {
      address: 'Udupi',
      firstName: 'Shravan Kumar',
      lastName: 'Hegde',
      phone: 8792225251,
    };

    const updatedMember = memberRepository.update(
      createdMember.memberId,
      updatedData
    );
    expect(updatedMember).toEqual({
      ...updatedData,
      memberId: createdMember.memberId,
    });
  });

  test('Tests for getting member by ID', () => {
    const createdMember = memberRepository.create(data);

    const retrievedMember = memberRepository.getById(createdMember.memberId);
    expect(retrievedMember).toEqual(createdMember);
  });

  test('Tests for listing members', () => {
    const data1: IMemberBase = {
      address: 'Mangalore',
      firstName: 'Shravan',
      lastName: 'Hegde',
      phone: 8792225251,
    };

    const data2: IMemberBase = {
      address: 'Mangalore',
      firstName: 'Preethesh',
      lastName: 'Devadiga',
      phone: 9632483331,
    };

    const createdMember1 = memberRepository.create(data1);
    const createdMember2 = memberRepository.create(data2);

    const result = memberRepository.list({ offset: 0, limit: 10, search: '' });

    expect(result.pagination.total).toBe(6);
  });
});
