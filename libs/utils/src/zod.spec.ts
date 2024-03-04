import { formatZodMessage } from './zod';
import { ZodError, ZodIssue, ZodIssueCode } from 'zod';

const makeErr = (issue: ZodIssue) => new ZodError([issue]);

const base = { message: 'Unused', path: ['foo', 'bar']};

describe('lib/zod', () => {
  describe('formatZodMessage', () => {
    describe.each([
      [ZodIssueCode.invalid_date, '', 'foo.bar is not a valid date', {}],
      [ZodIssueCode.invalid_enum_value, '', 'foo.bar must be one of "a" | "b" | "c"', { options: ['a', 'b', 'c']}],
      [ZodIssueCode.invalid_string, '', 'Invalid uuid at foo.bar', { message: 'Invalid uuid' }],
      [ZodIssueCode.invalid_type, ' - with a number and nan', 'foo.bar is either missing or malformatted. Expected number but received NaN', { expected: 'number', received: 'nan' }],
      [ZodIssueCode.invalid_type, ' - with "Required" in the message', 'foo.bar is a required field', { message: 'Required' }],
      [ZodIssueCode.invalid_type, ' - with incorrect types', 'Expected foo.bar to be a number but received string', { expected: 'number', received: 'string' }],
      [ZodIssueCode.too_big, ' - with a string that must be exact', 'foo.bar must be 5 characters long', { type: <const>'string', maximum: 5, exact: true }],
      [ZodIssueCode.too_big, ' - with a string (lte)', 'foo.bar must be less than or equal to 5 characters in length', { type: <const>'string', maximum: 5, inclusive: true }],
      [ZodIssueCode.too_big, ' - with a string (lt)', 'foo.bar must be less than 5 characters in length', { type: <const>'string', maximum: 5 }],
      [ZodIssueCode.too_big, ' - with a number (lte)', 'foo.bar must be less than or equal to 5', { type: <const>'number', maximum: 5, inclusive: true }],
      [ZodIssueCode.too_big, ' - with a number (lt)', 'foo.bar must be less than 5', { type: <const>'number', maximum: 5 }],
      [ZodIssueCode.too_big, ' - with a date (lte)', 'foo.bar must be before or on 2023-02-02', { type: <const>'date', maximum: '2023-02-02', inclusive: true }],
      [ZodIssueCode.too_big, ' - with a date (lt)', 'foo.bar must be before 2023-02-02', { type: <const>'date', maximum: '2023-02-02' }],
      [ZodIssueCode.too_big, ' - with an array (lte)', 'foo.bar must have fewer than or exactly 5 items', { type: <const>'array', maximum: 5, inclusive: true }],
      [ZodIssueCode.too_big, ' - with an array (lt)', 'foo.bar must have fewer than 5 items', { type: <const>'array', maximum: 5 }],
      [ZodIssueCode.too_big, ' - with a set (lte)', 'foo.bar must have fewer than or exactly 5 items', { type: <const>'set', maximum: 5, inclusive: true }],
      [ZodIssueCode.too_big, ' - with a set (lt)', 'foo.bar must have fewer than 5 items', { type: <const>'set', maximum: 5 }],
      [ZodIssueCode.too_big, ' - with <impossible default>', 'Validation failed for input object', { type: 'blah', maximum: 5 } as Partial<ZodIssue>],
      [ZodIssueCode.too_small, ' - with a string that must be exact', 'foo.bar must be 5 characters long', { type: <const>'string', minimum: 5, exact: true }],
      [ZodIssueCode.too_small, ' - with a string (gte)', 'foo.bar must be greater than or equal to 5 characters in length', { type: <const>'string', minimum: 5, inclusive: true }],
      [ZodIssueCode.too_small, ' - with a string (gt)', 'foo.bar must be greater than 5 characters in length', { type: <const>'string', minimum: 5 }],
      [ZodIssueCode.too_small, ' - with a number (gte)', 'foo.bar must be greater than or equal to 5', { type: <const>'number', minimum: 5, inclusive: true }],
      [ZodIssueCode.too_small, ' - with a number (gt)', 'foo.bar must be greater than 5', { type: <const>'number', minimum: 5 }],
      [ZodIssueCode.too_small, ' - with a date (gte)', 'foo.bar must be after or on 2023-02-02', { type: <const>'date', minimum: '2023-02-02', inclusive: true }],
      [ZodIssueCode.too_small, ' - with a date (gt)', 'foo.bar must be after 2023-02-02', { type: <const>'date', minimum: '2023-02-02' }],
      [ZodIssueCode.too_small, ' - with an array (gte)', 'foo.bar must have more than or exactly 5 items', { type: <const>'array', minimum: 5, inclusive: true }],
      [ZodIssueCode.too_small, ' - with an array (gt)', 'foo.bar must have more than 5 items', { type: <const>'array', minimum: 5 }],
      [ZodIssueCode.too_small, ' - with a set (gte)', 'foo.bar must have more than or exactly 5 items', { type: <const>'set', minimum: 5, inclusive: true }],
      [ZodIssueCode.too_small, ' - with a set (gt)', 'foo.bar must have more than 5 items', { type: <const>'set', minimum: 5 }],
      [ZodIssueCode.too_small, ' - with <impossible default>', 'Validation failed for input object', { type: 'blah', minimum: 5 } as Partial<ZodIssue>],
      [ZodIssueCode.unrecognized_keys, '', 'Unexpected keys a, b, and c on foo.bar', { keys: ['a', 'b', 'c']}],
      [ZodIssueCode.invalid_union, '', 'foo.bar did not match any of the expected formats', {}],
      [ZodIssueCode.invalid_arguments, '', 'Validation failed for input object', {}],
      [ZodIssueCode.invalid_intersection_types, '', 'Validation failed for input object', {}],
      [ZodIssueCode.invalid_literal, '', 'Validation failed for input object', {}],
      [ZodIssueCode.invalid_return_type, '', 'Validation failed for input object', {}],
      [ZodIssueCode.invalid_union_discriminator, '', 'Validation failed for input object', {}],
      [ZodIssueCode.not_finite, '', 'Validation failed for input object', {}],
      [ZodIssueCode.not_multiple_of, '', 'Validation failed for input object', {}],
      [ZodIssueCode.custom, '', 'Validation failed for input object', {}],
    ])('%s%s', (code: ZodIssueCode, addlMsg: string, errorMsg: string, issue: Partial<ZodIssue>) => {
      it('should return the proper error message', () => {
        expect(formatZodMessage(makeErr({ ...base, ...issue, code } as ZodIssue)))
          .toEqual(errorMsg);
      });
    });
  });
});
