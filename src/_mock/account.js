const account = {
  displayName: `${localStorage.getItem("email")?.substring(0, 12)}...`,
  email: localStorage.getItem("email"),
  photoURL: localStorage.getItem("image") || '/assets/images/avatars/avatar_default.png',
};

export default account;
