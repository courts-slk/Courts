export function setToken(token) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function removeToken() {
  localStorage.removeItem('token');
}

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function removeUser() {
  localStorage.removeItem('user');
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout() {
  removeToken();
  removeUser();
}
