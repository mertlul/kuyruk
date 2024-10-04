import React, { useState, useEffect } from 'react';
import { sha512 } from 'js-sha512'
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Admin Giriş';
    // Check if "Remember Me" cookie is set, and auto-fill the form fields
    const savedUsername = getCookie('adminUsername');
    const savedPassword = getCookie('adminPassword');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
      cookieLogin();
    }
  }, []);

  // Function to read a cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  async function cookieLogin() {
    // Send the login credentials to the server for authentication
    try {
      const userData = {
        username: getCookie('adminUsername'),
        password: sha512(process.env.REACT_APP_SALT + getCookie('adminPassword'))
      };
      const response = await fetch(process.env.REACT_APP_SERVER_URL + '/signIn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data === 'Done.') {
          // Redirect to the admin page on successful login
          //window.location.href = '/admin?restaurantId=YOUR_RESTAURANT_ID';
          setLoginMessage('');
          setCookie('restaurantId', data.restaurantId, (1/24));
          navigate('/admin-page?restaurantid=' + data.restaurantId)
        } else {
          // Show login error message
          setLoginMessage('Kullanıcı adı veya şifre hatalı.');
        }
      } else {
        // Show login error message
        setLoginMessage('Bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.');
      }
    } catch (error) {
      console.error('Error occurred during login:', error);
      // Show login error message
      setLoginMessage('Bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.');
    }
  }

  // Function to handle form submission
  async function handleFormSubmit(event) {
    event.preventDefault();

    if (!username || !password) {
      setLoginMessage('Alanlar boş bırakılmamalı.');
      return;
    }

    // Send the login credentials to the server for authentication
    try {
      const userData = {
        username: username,
        password: sha512(process.env.REACT_APP_SALT + password)
      };
      console.log(userData)
      const response = await fetch(process.env.REACT_APP_SERVER_URL + '/signIn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data === 'Done.') {
          // Redirect to the admin page on successful login
          //window.location.href = '/admin?restaurantId=YOUR_RESTAURANT_ID';
          setLoginMessage('');
          setCookie('restaurantId', data.restaurantId, (1/24));
          navigate('/admin-page?restaurantid=' + data.restaurantId)
        } else {
          // Show login error message
          setLoginMessage('Kullanıcı adı veya şifre hatalı.');
        }
      } else {
        // Show login error message
        setLoginMessage('Bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.');
      }
    } catch (error) {
      console.error('Error occurred during login:', error);
      // Show login error message
      setLoginMessage('Bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.');
    }
    // Save form data to cookies if "Remember Me" is checked
    saveFormDataToCookies();
  }

  // Function to set cookies
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
  }

  // Function to save form data to cookies if "Remember Me" is checked
  function saveFormDataToCookies() {
    if (rememberMe) {
      setCookie('adminUsername', username, 1); // Save username for 1 day
      setCookie('adminPassword', password, 1); // Save password for 1 day
    } else {
      // Clear cookies if "Remember Me" is unchecked
      setCookie('adminUsername', '', -1);
      setCookie('adminPassword', '', -1);
    }
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
      <h1 style={styles.heading}>Admin Giriş</h1>
      <form id="loginForm" onSubmit={handleFormSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="username" style={styles.label}>
            Kullanıcı Adı
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            aria-label="Kullanıcı Adı"
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>
            Şifre
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            aria-label="Şifre"
          />
        </div>
        <div style={styles.checkboxGroup}>
          <label htmlFor="rememberMe" style={styles.label}>
            Beni Hatırla
          </label>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={styles.checkbox}
            aria-label="Beni Hatırla"
          />
        </div>
        {loginMessage && <p id="loginMessage" style={styles.errorMessage}>{loginMessage}</p>}
        <button type="submit" style={styles.button}>Giriş Yap</button>
      </form>
    </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f0f0', // Gray background color
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px', // Adjust the max-width as needed
    margin: '20px',
    padding: '20px', // Add some padding to improve layout
    borderRadius: '10px', // Add rounded corners for better aesthetics
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', // Add a subtle shadow for depth
    background: '#fff', // Add a background color
  },
  heading: {
    margin: '0 0 20px',
    fontSize: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '20px',
  },
  label: {
    marginBottom: '5px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  checkbox: {
    margin: '5px',
  },
  errorMessage: {
    color: 'red',
    marginBottom: '10px',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    background: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default LoginForm;
