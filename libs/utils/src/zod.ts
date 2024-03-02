import { ZodError, ZodIssueCode } from 'zod';
import a from 'indefinite';
import listify from 'listify';

const indefiniteOptions = { articleOnly: true };

export class ValidationError extends Error {
  originalError: ZodError;

  constructor(message: string, originalError: ZodError) {
    super(message);
    this.originalError = originalError;
  }
}

export const formatZodError = (err: ZodError): Error => {
  const message = formatZodMessage(err);
  return new ValidationError(message, err);
};

// See https://zod.dev/ERROR_HANDLING for more on the types of errors
// and the properties present on those types.
export const formatZodMessage = (err: ZodError): string => {
  const { issues: [issue] } = err;
  const {
    code,
    message,
    path,
  } = issue;

  const strPath = path.length ? path.join('.') : 'The input';

  switch (code) {
    case ZodIssueCode.invalid_date:
      return `${ strPath } is not a valid date`;

    case ZodIssueCode.invalid_enum_value:
      return `${ strPath } must be one of "${ issue.options.join('" | "') }"`;

    case ZodIssueCode.invalid_string:
      return `${ message } at ${ strPath }`;

    case ZodIssueCode.invalid_type: {
      // Type coercion means that z.coerce.number() will throw
      // "Expected path to be a number but received a nan" which is
      // clearly wrong. As NaN is not json serializable anyway, if
      // we get { expected: 'number', received: 'nan' }, assume it
      // was undefined coerced to a number. This has the unfortunate
      // side effect that {} and non-number strings could look like
      // they're just missing altogether, so I'm adding an "or" in
      // the message here for that purpose.
      if (issue.expected === 'number' && issue.received === 'nan') {
        return `${ strPath } is either missing or malformatted. Expected number but received NaN`;
      } else if (message.includes('Required')) {
        return `${ strPath } is a required field`;
      } else {
        return `Expected ${ strPath } to be ${ a(issue.expected, indefiniteOptions) } ${ issue.expected } but received ${ issue.received }`;
      }
    }

    case ZodIssueCode.too_big:
      switch (issue.type) {
        case 'string':
          if (issue.exact) {
            return `${ strPath } must be ${ issue.maximum } characters long`;
          } else {
            return `${ strPath } must be less than${ issue.inclusive ? ' or equal to' : '' } ${ issue.maximum } characters in length`;
          }
        case 'number':
          return `${ strPath } must be less than${ issue.inclusive ? ' or equal to' : '' } ${ issue.maximum }`;
        case 'date':
          return `${ strPath } must be before${ issue.inclusive ? ' or on' : '' } ${ issue.maximum }`;
        case 'array':
        case 'set':
          return `${ strPath } must have fewer than${ issue.inclusive ? ' or exactly' : '' } ${ issue.maximum } items`;
        default:
          return 'Validation failed for input object';
      }

    case ZodIssueCode.too_small:
      switch (issue.type) {
        case 'string':
          if (issue.exact) {
            return `${ strPath } must be ${ issue.minimum } characters long`;
          } else {
            return `${ strPath } must be greater than${ issue.inclusive ? ' or equal to' : '' } ${ issue.minimum } characters in length`;
          }
        case 'number':
          return `${ strPath } must be greater than${ issue.inclusive ? ' or equal to' : '' } ${ issue.minimum }`;
        case 'date':
          return `${ strPath } must be after${ issue.inclusive ? ' or on' : '' } ${ issue.minimum }`;
        case 'array':
        case 'set':
          return `${ strPath } must have more than${ issue.inclusive ? ' or exactly' : '' } ${ issue.minimum } items`;
        default:
          return 'Validation failed for input object';
      }

    case ZodIssueCode.unrecognized_keys:
      return `Unexpected keys ${ listify(issue.keys) } on ${ strPath }`;

    case ZodIssueCode.invalid_union:
      return `${ strPath } did not match any of the expected formats`;


    // TODO: Figure out what these messages ought to be
    case ZodIssueCode.invalid_arguments:
    case ZodIssueCode.invalid_intersection_types:
    case ZodIssueCode.invalid_literal:
    case ZodIssueCode.invalid_return_type:
    case ZodIssueCode.invalid_union_discriminator:
    case ZodIssueCode.not_finite:
    case ZodIssueCode.not_multiple_of:
    case ZodIssueCode.custom:
      return 'Validation failed for input object';
  }
};
