import { DeleteResult } from 'typeorm';
import { hasFlag, setFlag, unsetFlag } from './haxeCompat';
import {
  checkDeleted,
  convertAllEmptyStringsToNull,
  deduplicateById,
} from './utils';

describe('TestUtils', () => {
  /*
   test deduplication by id
   */
  it('should be deduplicated', () => {
    const items = [
      { id: 1, name: 'Bobby' },
      { id: 2, name: 'Susana' },
      { id: 1, name: 'Michel' },
      { id: 3, name: 'Jean-Mi' },
    ];
    const items2 = deduplicateById(items);

    expect(items2).toHaveLength(3);
    expect(items2[0].id).toBe(1);
    expect(items2[1].id).toBe(2);
  });

  /**
   * Test read flags
   */
  it('should read correctly flags', () => {
    // 3 = XX0
    expect(hasFlag(0, 3)).toBeTruthy();
    expect(hasFlag(1, 3)).toBeTruthy();
    expect(hasFlag(2, 3)).toBeFalsy();
    // 0 = 000
    expect(hasFlag(0, 0)).toBeFalsy();
    expect(hasFlag(1, 0)).toBeFalsy();
    expect(hasFlag(2, 0)).toBeFalsy();
    // 7 = XXX
    expect(hasFlag(0, 7)).toBeTruthy();
    expect(hasFlag(1, 7)).toBeTruthy();
    expect(hasFlag(2, 7)).toBeTruthy();
    // 5 = X0X
    expect(hasFlag(0, 5)).toBeTruthy();
    expect(hasFlag(1, 5)).toBeFalsy();
    expect(hasFlag(2, 5)).toBeTruthy();
  });

  it('should write correctly flags', () => {
    let flag = 0;
    // set flag 0
    flag = setFlag(0, flag);
    expect(hasFlag(0, flag)).toBeTruthy();

    // set flag 5
    flag = setFlag(5, flag);
    expect(hasFlag(5, flag)).toBeTruthy();
    expect(hasFlag(0, flag)).toBeTruthy();
    // others should be false
    expect(hasFlag(1, flag)).toBeFalsy();
    expect(hasFlag(2, flag)).toBeFalsy();
    expect(hasFlag(3, flag)).toBeFalsy();
    expect(hasFlag(4, flag)).toBeFalsy();

    // set flag 2
    flag = setFlag(2, flag);
    expect(hasFlag(5, flag)).toBeTruthy();
    expect(hasFlag(0, flag)).toBeTruthy();
    expect(hasFlag(2, flag)).toBeTruthy();
    // others should be false
    expect(hasFlag(1, flag)).toBeFalsy();
    expect(hasFlag(3, flag)).toBeFalsy();
    expect(hasFlag(4, flag)).toBeFalsy();

    // unset flag 2
    flag = unsetFlag(2, flag);
    expect(hasFlag(5, flag)).toBeTruthy();
    expect(hasFlag(0, flag)).toBeTruthy();
    // others should be false
    expect(hasFlag(1, flag)).toBeFalsy();
    expect(hasFlag(2, flag)).toBeFalsy();
    expect(hasFlag(3, flag)).toBeFalsy();
    expect(hasFlag(4, flag)).toBeFalsy();

    // unset flag 5
    flag = unsetFlag(5, flag);
    expect(hasFlag(0, flag)).toBeTruthy();
    // others should be false
    expect(hasFlag(5, flag)).toBeFalsy();
    expect(hasFlag(1, flag)).toBeFalsy();
    expect(hasFlag(2, flag)).toBeFalsy();
    expect(hasFlag(3, flag)).toBeFalsy();
    expect(hasFlag(4, flag)).toBeFalsy();
  });

  /*
   test checkDeleted
   */
  describe('checkDeleted', () => {
    it('should be false when affected is not defined', () => {
      const mockDeleteResult: DeleteResult = {
        raw: '',
      };

      const result = checkDeleted(mockDeleteResult);

      expect(result).toBe(false);
    });

    describe('When affected result equals default expected value (1)', () => {
      let mockDeleteResult: DeleteResult;
      beforeAll(() => {
        mockDeleteResult = {
          raw: '',
          affected: 1,
        };
      });

      it('should be true when hrowError parameter is false', () => {
        expect(checkDeleted(mockDeleteResult)).toBe(true);
      });

      it('should be true an error when throwError parameter is true', () => {
        expect(checkDeleted(mockDeleteResult, 1, true)).toBe(true);
      });
    });

    describe('When affected result is not equal to expected', () => {
      let mockDeleteResult: DeleteResult;
      beforeAll(() => {
        mockDeleteResult = {
          raw: '',
          affected: 1,
        };
      });

      it('should be false when throwError param is false', () => {
        expect(checkDeleted(mockDeleteResult, 2)).toBe(false);
      });

      it('should throw an error when throwError parameter is true', () => {
        expect(() => checkDeleted(mockDeleteResult, 2, true)).toThrow(
          'Record has not been deleted',
        );
      });
    });
  });

  /*
   test convertAllEmptyStringsToNull
   */
  describe('convertAllEmptyStringsToNull', () => {
    it('all values should be null when they are empty strings at first', () => {
      const user = {
        phone: '',
        address1: '  ',
        address2: '   ',
        zipCode: '    ',
        city: '     ',
      };

      const result = convertAllEmptyStringsToNull(user);

      Object.keys(result).forEach((key) => {
        expect(result[key]).toBeNull();
      });
    });

    it('should be the same object when values are not empty strings', () => {
      const user = {
        phone: '0600000000',
        address1: '1 rue des Pommes',
        address2: 'Appt. 2',
        zipCode: '23000',
        city: 'Gueret',
      };

      const result = convertAllEmptyStringsToNull(user);

      Object.keys(result).forEach((key) => {
        expect(result[key]).toBe(user[key]);
      });
    });
  });
});
