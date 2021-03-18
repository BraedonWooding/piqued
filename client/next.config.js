module.exports = {
  trailingSlash: true,
  exportPathMap: async function () {
    const paths = {
      "/": { page: "/" },
    };

    return paths;
  },
};
