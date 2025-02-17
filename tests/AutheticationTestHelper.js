/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const AutheticationsTestHelper = {
  async getAccessTokenHelper(server) {
    const responsRegister = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'johndoe',
        password: 'supersecrectpassword',
        fullname: 'John Doe',
      },
    });

    const responseLogin = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'johndoe',
        password: 'supersecrectpassword',
      },
    });

    const {
      data: {
        addedUser: { id: userId },
      },
    } = JSON.parse(responsRegister.payload);

    const {
      data: { accessToken },
    } = JSON.parse(responseLogin.payload);

    return { userId, accessToken };
  },

  async cleanTable() {
    await pool.query('DELETE FROM authentications WHERE 1=1');
  },
};

module.exports = AutheticationsTestHelper;
