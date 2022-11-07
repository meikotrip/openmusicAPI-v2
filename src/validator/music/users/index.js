const InvariantError = require('../../../exceptions/InvariantError');
const { userPayloadSchema } = require('./schema');

const UsersValidator = {
  validateUserPayload: (payload) => {
    const validationResult = userPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UsersValidator;
