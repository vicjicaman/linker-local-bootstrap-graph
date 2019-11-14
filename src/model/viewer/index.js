export const get = cxt => {
  const username = cxt.request.user ? cxt.request.user.username : null;
  return {
    id: username,
    username
  };
};
