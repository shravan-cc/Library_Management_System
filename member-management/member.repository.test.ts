import { describe, beforeEach } from 'vitest';

import { MemberRepository } from './member.repository';
import { IMember, IMemberBase } from './models/member.model';
import exp from 'constants';

describe('Tests for member class methods', () => {
  let members: IMember[];
  let memberRepository: any;
  beforeEach(() => {
    members = [
      {
        address: 'Mangalore',
        firstName: 'Shravan',
        lastName: 'Hegde',
        memberId: 1,
        phone: 8792225251,
      },
      {
        address: 'Mangalore',
        firstName: 'Preethesh',
        lastName: 'Devadiga',
        memberId: 2,
        phone: 9632483331,
      },
      {
        address: 'Mangalore',
        firstName: 'Vignesh',
        lastName: 'Devadiga',
        memberId: 3,
        phone: 9632453331,
      },
    ];
    memberRepository = new MemberRepository();
  });
  test('Tests for creating member', () => {
    const data: IMemberBase = members[0];
    expect(memberRepository.create(data)).toEqual({
      address: 'Mangalore',
      firstName: 'Shravan',
      lastName: 'Hegde',
      memberId: 1,
      phone: 8792225251,
    });
    expect(memberRepository.create(data)).toBeDefined();
  });

  test('Tests for deleting members ', () => {
    expect(memberRepository.delete(members[0].memberId)).toEqual({
      address: 'Mangalore',
      firstName: 'Shravan',
      lastName: 'Hegde',
      memberId: 1,
      phone: 8792225251,
    });
  });
});
