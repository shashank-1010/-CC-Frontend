export const getUser = () => {
  try {
    const userStr = localStorage.getItem('cc_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};
