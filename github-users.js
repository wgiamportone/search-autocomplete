const axios = require('axios');

export function getUserNames(url, query) {
  const newURL = new URL ('', url + query, 2);

  return axios.get(newURL)
    .then(function (response) {
      // gather and sort user data
      const users = response.data.items;
      const sortedUsers = users.map(user => ({
        text: user.login,
        value: user.id,
      }));

      return sortedUsers;
    })
    .catch(function (error) {
      console.log(error);
    });
}
