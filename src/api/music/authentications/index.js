const AuthenticationsHanlder = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, {
    authenticationsService,
    usersService,
    tokenManager,
    validator,
  }) => {
    const authenticationsHanlder = new AuthenticationsHanlder(
      authenticationsService,
      usersService,
      tokenManager,
      validator,
    );

    server.route(routes(authenticationsHanlder));
  },
};
