export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

export function isValidPhone(phone) {
  return /^[+\d\s\-()]+$/.test(phone);
}

export function validateRegister(data) {
  const errors = {};
  if (!data.full_name?.trim()) errors.full_name = 'Name is required';
  if (!data.email) errors.email = 'Email is required';
  else if (!isValidEmail(data.email)) errors.email = 'Invalid email';
  if (!data.password) errors.password = 'Password is required';
  else if (!isValidPassword(data.password)) errors.password = 'At least 6 characters';
  if (data.phone && !isValidPhone(data.phone)) errors.phone = 'Invalid phone';
  return errors;
}

export function validateLogin(data) {
  const errors = {};
  if (!data.email) errors.email = 'Email is required';
  if (!data.password) errors.password = 'Password is required';
  return errors;
}

export function validateCourt(data) {
  const errors = {};
  if (!data.name?.trim()) errors.name = 'Court name is required';
  if (!data.city) errors.city = 'City is required';
  if (!data.address?.trim()) errors.address = 'Address is required';
  if (!data.price_per_hour) errors.price_per_hour = 'Price is required';
  else if (parseFloat(data.price_per_hour) <= 0) errors.price_per_hour = 'Price must be positive';
  return errors;
}
