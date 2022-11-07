const InvariantError = require('../../../exceptions/InvariantError');
const {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
} = require('./schema');

const AuthenticationsValidator = {
  validatePostAuthenticationPayload: (payload) => {
    const validatationResult = PostAuthenticationPayloadSchema.validate(payload);
    if (validatationResult.error) {
      throw new InvariantError(validatationResult.error.message);
    }
  },
  validatePutAuthenticationPayload: (payload) => {
    const validatationResult = PutAuthenticationPayloadSchema.validate(payload);
    if (validatationResult.error) {
      throw new InvariantError(validatationResult.error.message);
    }
  },
  validateDeleteAuthenticationPayload: (payload) => {
    const validatationResult = DeleteAuthenticationPayloadSchema.validate(payload);
    if (validatationResult.error) {
      throw new InvariantError(validatationResult.error.message);
    }
  },
};

module.exports = AuthenticationsValidator;
