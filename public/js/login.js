/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// Function for logging the user in
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    // If the API returns success → login was correct
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');

      // Redirect user to homepage after 1.5 sec
      window.setTimeout(() => {
        // Load homepage (this reloads the navbar with the logged-in user)
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/users/logout',
    });

    if (res.data.status === 'success') location.reload(true);
  } catch (err) {
    showAlert('error', 'Error logging out, Try again');
  }
};
