import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { RingLoader } from "react-spinners"; // Import the spinner component

const AdminPage = () => {
  // Replace 'YOUR_BACKEND_URL' with the actual URL of your backend API.
  const backendUrl = 'YOUR_BACKEND_URL';
  const restaurantId = getRestaurantIdFromUrl();
  //var restaurantId = 1

  //TO-DO: main page metinleri - beraber karar verilebilir
  //TO-DO: reset waitlist upon closing time - mert
  const [userList, setUserList] = useState([]);
  const [count, setCount] = useState([]);
  const [readyUserList, setReadyUserList] = useState([]);
  const navigate = useNavigate();
  const [averageWaitTime, setAverageWaitTime] = useState('');
  const [sortOption, setSortOption] = useState('time-desc');
  const [readySortOption, setReadySortOption] = useState('time-desc');
  const [newUserName, setNewUserName] = useState('');
  const [newUserSurname, setNewUserSurname] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newNumberOfPeople, setNewNumberOfPeople] = useState(1);
  const [newAverageWaitTime, setNewAverageWaitTime] = useState('');
  const [newMaxReservationCount, setNewMaxReservationCount] = useState('');
  const [newOpeningTime, setNewOpeningTime] = useState('');
  const [newClosingTime, setNewClosingTime] = useState('');
  const [maxReservationCount, setMaxReservationCount] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [queueClosed, setQueueClosed] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [queueSize, setQueueSize] = useState(0);
  const [queueStatus, setQueueStatus] = useState(0);
  const [restaurantDetailsOpen, setRestaurantDetailsOpen] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(true); // Default open
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // State to control loading state
  const [selectedMenu, setSelectedMenu] = useState('waitlist'); // Default is 'Bekleme Sırası Bilgileri'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to manage sidebar visibility
  const [countryCodes, setCountryCodes] = useState([
    { code: '+90', name: '' , numOfDigits: 12},
    { code: '+39', name: '' , numOfDigits: 12},
    // Add more country codes and names as needed
  ]);
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[0].code);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar visibility
  };
  const handleMenuClick = (menu) => {
    setSelectedMenu(menu); // Set the selected menu item
    toggleSidebar(); // Close the sidebar
  };


  function handleCountryCodeChange(event) {
    setSelectedCountryCode(event.target.value);
  }

  function isValidPhoneNumber(phone, count) {
    const cleanedPhone = phone.replace(/\s+/g, '');
    // The regex pattern to validate phone numbers based on the count.
    const phonePattern = getPhonePattern(count);
  
    return phonePattern.test(cleanedPhone);
  }
  
  function getPhonePattern(count) {
    // Define regex patterns based on the count.
    switch (count) {
      case 7:
        // Pattern for 7-digit phone numbers (e.g., 1234567).
        return /^[0-9]{7}$/;
      case 12:
        // Pattern for 10-digit phone numbers (e.g., 1234567890).
        return /^[0-9]{12}$/;
      case 11:
        // Pattern for 11-digit phone numbers (e.g., 11234567890).
        return /^[0-9]{11}$/;
      // Add more patterns for other counts as needed.
      default:
        // Default pattern for unknown counts.
        return /^[a-z]+$/;
    }
  }

  // Function to handle selecting a user from the list
  function handleSelectUser(user) {
    if (selectedUser && selectedUser.userid === user.userid) {
      // If the same row is clicked again, deselect the user
      setSelectedUser(null);
    } else {
      setSelectedUser(user);
    }
  }

  // Function to toggle the restaurant details tab
  const toggleRestaurantDetails = () => {
    setRestaurantDetailsOpen(!restaurantDetailsOpen);
    if(waitlistOpen) {
      setWaitlistOpen(false);
    }
    if(addUserOpen) {
      setAddUserOpen(false);
    }
  };

  const toggleWaitlist = () => {
    setWaitlistOpen(!waitlistOpen);
    if(restaurantDetailsOpen) {
      setRestaurantDetailsOpen(false);
    }
    if(addUserOpen) {
      setAddUserOpen(false);
    }
  };

  const toggleAddUser = () => {
    setAddUserOpen(!addUserOpen);
    if(restaurantDetailsOpen) {
      setRestaurantDetailsOpen(false);
    }
    if(waitlistOpen) {
      setWaitlistOpen(false);
    }
  };

  function getTotalUsers() {
    const totalUsersElement = document.getElementById('totalUsers');
    totalUsersElement.textContent = userList
  }

   // Function to save the queue status to the backend when the toggle is changed.
   async function saveQueueStatus() {
    const userData = {
      queueStatus: queueClosed,
      restaurantid : getRestaurantIdFromUrl()
    };

    const response = await fetch(process.env.REACT_APP_SERVER_URL + '/saveQueueStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    console.log('Queue status saved successfully.')
  }

  async function saveRestaurantDetails() {
    const userData = {
      restaurantid: restaurantId,
      maxReservationCount: newMaxReservationCount,
      averageWaitTime: newAverageWaitTime,
      openingTime: newOpeningTime,
      closingTime: newClosingTime,
    };

    const response = await fetch(process.env.REACT_APP_SERVER_URL + '/saveRestaurantDetails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    console.log('Restaurant details saved successfully.')
  }

  // Function to save the closing time and trigger post to backend.
  async function saveClosingTimeAndPostData() {
    const userData = {
      closingTime: newClosingTime,
      restaurantid : getRestaurantIdFromUrl()
    };

    const response = await fetch(process.env.REACT_APP_SERVER_URL + '/saveClosingTime', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    console.log('Closing time saved successfully.')
  }

    // Function to save the closing time and trigger post to backend.
    async function saveOpeningTimeAndPostData() {
      const userData = {
        openingTime: newOpeningTime,
        restaurantid : getRestaurantIdFromUrl()
      };
  
      const response = await fetch(process.env.REACT_APP_SERVER_URL + '/saveOpeningTime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      console.log('Opening time saved successfully.')
    }

  // Function to save the maximum reservation count to the database.
  async function saveMaxReservationCount() {
    const userData = {
      maxReservationCount: newMaxReservationCount,
      restaurantid : getRestaurantIdFromUrl()
    };

    const response = await fetch(process.env.REACT_APP_SERVER_URL + '/saveMaxReservationCount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();

    console.log('Maximum reservation count saved successfully.');
  }

  // Function to update the average wait time for people in the queue.
  async function updateAverageWaitTime() {
    const userData = {
      averageWaitTime: newAverageWaitTime,
      restaurantid : getRestaurantIdFromUrl()
    };

    const response = await fetch(process.env.REACT_APP_SERVER_URL + '/saveAverageWaitTime', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    console.log('Average wait time updated successfully.');

    // Refresh the average wait time after updating.
    // fetchAverageWaitTime();
  }

  // Function to manually add a user to the list.
  async function addUserToList() {
    const validationErrors = {};

    if (!newUserName || !newUserSurname || !(selectedCountryCode + newUserPhone) || !newNumberOfPeople) {
      if (!newUserName) {
        validationErrors.name = 'Isim giriniz.';
      }

      if (!newUserSurname) {
        validationErrors.surname = 'Soyisim giriniz.';
      }

      if (!(selectedCountryCode + newUserPhone)) {
        validationErrors.phone = 'Telefon giriniz.';
      }

      if (!newNumberOfPeople) {
        validationErrors.numOfPeople = 'Kişi sayısı giriniz.';
      }

      setErrors(validationErrors);
    }

    if (!isValidPhoneNumber((countryCodes[0].code + newUserPhone).substring(1), countryCodes[0].numOfDigits)) {
      console.log(countryCodes[0].code)
      validationErrors.phone = 'Geçerli bir telefon giriniz.';
      setErrors(validationErrors);
    }

    if (Object.keys(validationErrors).length === 0) {
      try {
        setErrors('');
        // Implement your logic here to add the user to the list.
        // ...
        const userData = {
          name: newUserName,
          phone: (selectedCountryCode + newUserPhone),
          surname: newUserSurname,
          numOfPeople: newNumberOfPeople,
          restaurantid : getRestaurantIdFromUrl()
          // Add other user details as needed
        };
        const response = await fetch(process.env.REACT_APP_SERVER_URL + '/addNewUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        const data = await response.json();
        if(response.ok) {
           // Update the user list state with the new user.
        setUserList((prevUserList) => [...prevUserList, userData]);

        // Clear the input fields after adding the user.
        setNewUserName('');
        setNewUserSurname('');
        setNewUserPhone('');
        setNewNumberOfPeople(1);
        fetchUserList();
        } else {
          validationErrors.phone = 'Telefon giriniz.';
          setErrors(validationErrors);
        }
        } catch (error) {
        console.error('Error submitting form:', error);
        } finally {
      }
    }
  }

  // Function to fetch the user list from the backend.
  async function fetchUserList() {
    //setIsLoading(true);
    try {
      const userData = {
        restaurantid : getRestaurantIdFromUrl()
      };
      const response = await fetch(process.env.REACT_APP_SERVER_URL + '/fetchUserList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if(response.ok) {
        const data = await response.json();
        const readyUserList = [];
        const notReadyUserList = [];

        console.log(data.data)
        for (let i = 0; i < data.data.length; i++) {
          if(data.data[i].readyF == 0) {
            console.log(data[i])
            notReadyUserList.push(data.data[i]);
          } else {
            readyUserList.push(data.data[i]);
          }
      }
        setUserList(notReadyUserList);
        setReadyUserList(readyUserList);
        setIsLoading(false);
      } else {
        //setIsLoading(true);
      }
      
    } catch (error) {
      console.error('Error fetching user list:', error);
      setUserList([]);
      setReadyUserList([]);
      setIsLoading(true);
    }
  }

  // Function to fetch the average wait time from the backend.
  async function fetchRestaurantDetails() {
    if(getCookie('restaurantId') == "null") {
      navigate('/admin-login')
    } else {
      try {
        //setIsLoading(true);
        const userData = {
          restaurantid : getRestaurantIdFromUrl()
        };
        const response = await fetch(process.env.REACT_APP_SERVER_URL + '/fetchRestaurantDetails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        if(response.ok) {
          const data = await response.json();
          setAverageWaitTime(data.averageWaitTime);
          setMaxReservationCount(data.availableNumbers);
          setClosingTime(data.closingTime);
          setOpeningTime(data.openingTime);
          setRestaurantName(data.restaurantName);
          setQueueSize(data.queueSize);
          setQueueClosed(data.queueStatus);
          //setIsLoading(false);
        } else {
          //setIsLoading(true);
        }
      } catch (error) {
        console.error('Error fetching average wait time:', error);
        setAverageWaitTime('');
        //setIsLoading(true);
      }
    }
  }

  async function fetchRestaurantDetails2() {
    if(getCookie('restaurantId') == "null") {
      navigate('/admin-login')
    } else {
      try {
        //setIsLoading(true);
        const userData = {
          restaurantid : getRestaurantIdFromUrl()
        };
        const response = await fetch(process.env.REACT_APP_SERVER_URL + '/fetchRestaurantDetails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        if(response.ok) {
          const data = await response.json();
          setNewAverageWaitTime(data.averageWaitTime);
          setNewMaxReservationCount(data.availableNumbers);
          setNewClosingTime(data.closingTime);
          setNewOpeningTime(data.openingTime);
          setRestaurantName(data.restaurantName);
          setQueueSize(data.queueSize);
          setQueueClosed(data.queueStatus);
        } else {
          //setIsLoading(true);
        }
      } catch (error) {
        console.error('Error fetching average wait time:', error);
        setAverageWaitTime('');
        //setIsLoading(true);
      }
    }
  }

  //TO-DO: Sıradaki kişiyi (readyF = 1 && checkF == 0) yukarda ayrı göster?
  // Function to handle user check-in action.
  async function checkInUser(phoneNumber) {
    const userData = {
      userphone: phoneNumber,
      restaurantid : getRestaurantIdFromUrl()
    };

    const response = await fetch(process.env.REACT_APP_SERVER_URL + '/checkInUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    console.log(`User with phone number ${phoneNumber} has been checked in.`);
    // Refresh the user list after check-in.
    fetchUserList();
    fetchRestaurantDetails();
  }

  // Function to remove a user from the queue based on their phone number.
  async function removeUser(phoneNumber) {
    const userData = {
      userphone: phoneNumber,
      restaurantid : getRestaurantIdFromUrl()
    };

    const response = await fetch(process.env.REACT_APP_SERVER_URL + '/removeUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    console.log(`User with phone number ${phoneNumber} has been removed from the queue.`);
    // Refresh the user list after removal.
    fetchUserList();
    fetchRestaurantDetails();
  }

  // Function to send SMS notification using Twilio.
  async function sendSmsNotification(phoneNumber) {
    const userData = {
      userphone: phoneNumber,
      restaurantid : getRestaurantIdFromUrl()
    };

    const response = await fetch(process.env.REACT_APP_SERVER_URL + '/sendSMS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    console.log('SMS notification sent successfully!');
  }

  async function callNumber(phoneNumber) {
    const telUri = `tel:${phoneNumber}`;
    window.open(telUri);
  }

  // Function to handle the sort option change event.
  function handleSortOptionChange(event) {
    const sortOption = event.target.value;
    setSortOption(sortOption);
  }

  function handleReadySortOptionChange(event) {
    const readySortOption = event.target.value;
    setReadySortOption(readySortOption);
  }

  // Function to get the sorted user list based on the selected sort option
  function getSortedUserList() {
    let sortedList = [...userList];
    switch (sortOption) {
      case 'time-asc':
        sortedList.sort((a, b) => (a.reservationTime > b.reservationTime ? 1 : -1));
        break;
      case 'time-desc':
        sortedList.sort((a, b) => (a.reservationTime < b.reservationTime ? 1 : -1));
        break;
      case 'name-asc':
        sortedList.sort((a, b) => (a.name > b.name ? 1 : -1));
        break;
      case 'name-desc':
        sortedList.sort((a, b) => (a.name < b.name ? 1 : -1));
        break;
      default:
        break;
    }
    return sortedList;
  }

  function getSortedReadyUserList() {
    let sortedList = [...readyUserList];
    switch (readySortOption) {
      case 'time-asc':
        sortedList.sort((a, b) => (a.reservationTime > b.reservationTime ? 1 : -1));
        break;
      case 'time-desc':
        sortedList.sort((a, b) => (a.reservationTime < b.reservationTime ? 1 : -1));
        break;
      case 'name-asc':
        sortedList.sort((a, b) => (a.name > b.name ? 1 : -1));
        break;
      case 'name-desc':
        sortedList.sort((a, b) => (a.name < b.name ? 1 : -1));
        break;
      default:
        break;
    }
    return sortedList;
  }

  // Function to get the restaurant ID from the URL
  function getRestaurantIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get('restaurantid') != null){
      return urlParams.get('restaurantid');
    } else {
      return getCookie('restaurantId');
    }
  }

  // Function to handle admin logout.
  async function adminLogout() {
    const savedUsername = getCookie('adminUsername');
    const savedPassword = getCookie('adminPassword');
    setCookie('adminUsername', '', -1);
    setCookie('adminPassword', '', -1);
    setCookie('restaurantId', null, -1);
    navigate('/admin-login')
  }

  // Function to read a cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // Function to set cookies
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
  }

  useEffect(() => {
    document.title = 'Admin Sayfası';
    fetchRestaurantDetails();
    fetchRestaurantDetails2();
    fetchUserList();
  }, []);

  useEffect(() => {
    fetchRestaurantDetails();
    //fetchUserList();
  }, [userList]);

  useEffect(() => {
    setTimeout(() => {
      setCount((count) => count + 1);
    }, 5000);
    fetchUserList();
  }, [count]);

   // Effect to disable scrolling when the sidebar is open
   useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'; // Disable scrolling
    } else {
      document.body.style.overflow = ''; // Re-enable scrolling
    }

    return () => {
      document.body.style.overflow = ''; // Clean up on component unmount
    };
  }, [isSidebarOpen]);

    // Effect to handle clicks outside the sidebar to close it
    useEffect(() => {
      const handleClickOutside = (event) => {
        const sidebar = document.getElementById('sidebar'); // Get the sidebar element
        const menuIcon = document.getElementById('menuIcon');
        if (sidebar && (!sidebar.contains(event.target) && !menuIcon.contains(event.target))) {
          setIsSidebarOpen(false); // Close sidebar if clicked outside
        }
      };
  
      // Add event listener for clicks outside the sidebar
      document.addEventListener('mousedown', handleClickOutside);
  
      // Cleanup listener on unmount
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

  const renderContent = () => {
    switch (selectedMenu) {
      case 'restaurantDetails':
        return (
          <div style={styles.restaurantDetails}>
            <h2>Restoran Bilgileri</h2>
            <p style={styles.info}>Sıradaki Rezervasyon Sayısı: {queueSize}</p>
            <div style={styles.centered}>
              <p style={styles.info}>Maksimum Rezervasyon Kapasitesi:</p>
              <input
                type="number"
                value={newMaxReservationCount}
                onChange={(e) => setNewMaxReservationCount(e.target.value)}
                placeholder="Maksimum Rezervasyon Sayısı"
                style={styles.input}
              />
              <p style={styles.info}>Ortalama Bekleme Süresi:</p>
              <input
                type="number"
                value={newAverageWaitTime}
                onChange={(e) => setNewAverageWaitTime(e.target.value)}
                placeholder="Ortalama Bekleme Süresi (dakika)"
                style={styles.input}
              />
              <p style={styles.info}>Restoran Açılış Saati:</p>
              <input
                type="time"
                value={newOpeningTime}
                onChange={(e) => setNewOpeningTime(e.target.value)}
                style={styles.input}
              />
              <p style={styles.info}>Restoran Kapanış Saati:</p>
              <input
                type="time"
                value={newClosingTime}
                onChange={(e) => setNewClosingTime(e.target.value)}
                style={styles.input}
              />
              <button style={styles.button} onClick={saveRestaurantDetails}>
                Kaydet
              </button>
              <label>
                Bekleme Sırası Aktif:
              <input
                type="checkbox"
                checked={queueClosed}
                onChange={(e) => {
                  setQueueClosed(e.target.checked);
                  saveQueueStatus(); // Trigger save to backend when the toggle is changed
                }}
                style={{ marginLeft: '5px' , marginTop: '10px',  marginBottom: '20px'}}
              />
            </label>
            </div>
          </div>
        );
      case 'waitlist':
        return (
          <div>
          <div style={styles.restaurantDetails}>
          <h2 style={{marginTop:'10px'}}>Bekleme Sırası Bilgileri</h2>
            {getSortedReadyUserList().length === 0 ? (
              <p style={{marginTop:'10px'}}>Sırası Gelen Kimse Yok</p> // Message when the list is empty
            ) : (
              <>
                <p style={{marginTop:'10px'}}>Sırası Gelenler</p>
                <div style={styles.selectContainer}>
                  <label htmlFor="readySortOption" style={styles.label}>Filtrele:</label>
                  <select 
                    id="readySortOption" 
                    value={readySortOption} 
                    onChange={handleReadySortOptionChange} 
                    style={styles.select}
                  >
                    <option value="time-desc">Tarih (Azalan)</option>
                    <option value="time-asc">Tarih (Artan)</option>
                    <option value="name-desc">İsim (Z'den A'ya)</option>
                    <option value="name-asc">İsim (A'dan Z'ye)</option>
                  </select>
                </div>
                <table style={styles.userList}>
                  <thead>
                    <tr>
                      <th>İsim</th>
                      <th>Soyisim</th>
                      <th>Kişi Sayısı</th>
                      <th>Rezervasyon Saati</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedReadyUserList().map((user, index) => (
                      <React.Fragment key={user.userid}>
                        <tr
                          onClick={() => handleSelectUser(user)}
                          style={{
                            borderTop: '1px solid #ccc', // Add border style
                            padding: '10px 0',
                            cursor: 'pointer', // Change cursor to pointer on hover
                            backgroundColor: index % 2 === 0 ? '' : '#f2f2f2', // Apply alternate-row class to alternate rows
                          }}
                        >
                          <td style={styles.centeredInputCell}>{user.name}</td>
                          <td style={styles.centeredInputCell}>{user.surname}</td>
                          <td style={styles.centeredInputCell}>{user.numOfPeople}</td>
                          <td style={styles.centeredInputCell}>{user.reservationTime}</td>
                        </tr>
                        {/* Render the actions for the selected user */}
                        {selectedUser && selectedUser.userid === user.userid && (
                          <tr>
                            <td colSpan="4">
                              <div style={styles.actionsContainer}>
                                <button 
                                  style={styles.actionButton} 
                                  onClick={() => checkInUser(selectedUser.phone)}
                                >
                                  Kişiyi İçeri Al
                                </button>
                                <button 
                                  style={styles.actionButton} 
                                  onClick={() => callNumber(selectedUser.phone)}
                                >
                                  Sırası Geldi Bilgilendirmesi Yolla
                                </button>
                                <button 
                                  style={styles.actionButton} 
                                  onClick={() => removeUser(selectedUser.phone)}
                                >
                                  Kişiyi Listeden Çıkar
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </>
            )}
             <hr style={{ width: '100%', margin: '20px 0', borderColor: '#ccc' }} />
          {getSortedUserList().length === 0 ? (
            <p style={{marginTop:'10px'}}>Sırada Bekleyen Kimse Yok</p> // Message when the list is empty
          ) : (
            <>
              <p style={{marginTop:'10px'}}>Sırada Bekleyenler</p>
              <div style={styles.selectContainer}>
                <label htmlFor="sortOption" style={styles.label}>Filtrele:</label>
                <select 
                  id="sortOption" 
                  value={sortOption} 
                  onChange={handleSortOptionChange} 
                  style={styles.select}
                >
                  <option value="time-desc">Tarih (Azalan)</option>
                  <option value="time-asc">Tarih (Artan)</option>
                  <option value="name-desc">İsim (Z'den A'ya)</option>
                  <option value="name-asc">İsim (A'dan Z'ye)</option>
                </select>
              </div>
              <table style={styles.userList}>
                <thead>
                  <tr>
                    <th>İsim</th>
                    <th>Soyisim</th>
                    <th>Kişi Sayısı</th>
                    <th>Rezervasyon Saati</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedUserList().map((user, index) => (
                    <React.Fragment key={user.userid}>
                      <tr
                        onClick={() => handleSelectUser(user)}
                        style={{
                          borderTop: '1px solid #ccc', // Add border style
                          padding: '10px 0',
                          cursor: 'pointer', // Change cursor to pointer on hover
                          backgroundColor: index % 2 === 0 ? '' : '#f2f2f2', // Apply alternate-row class to alternate rows
                        }}
                      >
                        <td style={styles.centeredInputCell}>{user.name}</td>
                        <td style={styles.centeredInputCell}>{user.surname}</td>
                        <td style={styles.centeredInputCell}>{user.numOfPeople}</td>
                        <td style={styles.centeredInputCell}>{user.reservationTime}</td>
                      </tr>
                      {/* Render the actions for the selected user */}
                      {selectedUser && selectedUser.userid === user.userid && (
                        <tr>
                          <td colSpan="4">
                            <div style={styles.actionsContainer}>
                              <button 
                                style={styles.actionButton} 
                                onClick={() => checkInUser(selectedUser.phone)}
                              >
                                Kişiyi İçeri Al
                              </button>
                              <button 
                                style={styles.actionButton} 
                                onClick={() => sendSmsNotification(selectedUser.phone)}
                              >
                                Sırası Geldi Bilgilendirmesi Yolla
                              </button>
                              <button 
                                style={styles.actionButton} 
                                onClick={() => removeUser(selectedUser.phone)}
                              >
                                Kişiyi Listeden Çıkar
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody> 
              </table>
            </>
          )}
        </div>
        </div>
        );
      case 'addPerson':
        return (
          <div>
            {
              <div style={styles.restaurantDetails}>
                <h2>Kişi Ekle</h2>
              <div style={styles.formSection}>
              <input type="text" id="name" className={errors.name ? 'error' : ''} placeholder="İsim giriniz" required style={{ margin: '10px', width:'300px', fontSize: '1em', padding: '10px', borderColor: errors.name ? 'red' : '' , borderRadius: '10px'}} value={newUserName} onChange={(e) => setNewUserName(e.target.value)}/>
                {errors.name && <p style={{marginTop: '-10px', marginBottom: '0px', color: 'red' }}>{errors.name}</p>}
                <input type="text" id="surname" className={errors.surname ? 'error' : ''} placeholder="Soyisim giriniz" required style={{ margin: '10px', width:'300px', fontSize: '1em', padding: '10px', borderColor: errors.surname ? 'red' : '' , borderRadius: '10px'}} value={newUserSurname} onChange={(e) => setNewUserSurname(e.target.value)}/>
                {errors.surname && <p style={{marginTop: '-10px', marginBottom: '0px', color: 'red' }}>{errors.surname}</p>}
                <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '10px', fontSize: '1em', padding: '10px' }}>
                  <select
                    id="countryCode"
                    value={selectedCountryCode}
                    onChange={handleCountryCodeChange}
                    required
                    style={{ fontSize: '1em', padding: '10px', borderRadius: '10px' }}
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {`${country.name} (${country.code})`}
                     </option>
                    ))}
                  </select>
                <input
                  type="text"
                  id="phone"
                  className={errors.phone ? 'error' : ''}
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="Telefon giriniz"
                  required
                  style={{
                    flex: 1,
                    marginLeft: '5px',
                    marginRight: '5px',
                    fontSize: '1em',
                    padding: '10px',
                    borderColor: errors.phone ? 'red' : '',
                    borderRadius: '10px',
                  }}
                />
                </div>
                {errors.phone && <p style={{ marginTop: '-20px', marginBottom: '0px', color: 'red' }}>{errors.phone}</p>}
                <div>
                  <input type="number" id="numOfPeople" className={errors.numOfPeople ? 'error' : ''} placeholder="Kişi sayısı" required style={{ width:'300px', margin: '10px', marginLeft:'10px', fontSize: '1em', padding: '10px', borderColor: errors.surname ? 'red' : '' , borderRadius: '10px'}} value={newNumberOfPeople} onChange={(e) => setNewNumberOfPeople(e.target.value)}/>
                </div>
                {errors.numOfPeople && <p style={{ marginTop: '0px', marginBottom: '0px', color: 'red' }}>{errors.numOfPeople}</p>}
              <button style={styles.button} onClick={addUserToList}>Kişi Ekle</button>
            </div>
              </div>
          }
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.pageContainer}>

      <div id="menuIcon" style={styles.menuIcon} onClick={toggleSidebar}>
        ☰ 
      </div>
      {isSidebarOpen && (
        <div style={styles.sidebarOverlay}>
        <div  id="sidebar" style={styles.sidebar}>
          <div style={styles.sidebarItem} onClick={() => handleMenuClick('restaurantDetails')}>
            Restoran Bilgileri
          </div>
          <div style={styles.sidebarItem} onClick={() => handleMenuClick('waitlist')}>
            Bekleme Sırası Bilgileri
          </div>
          <div style={styles.sidebarItem} onClick={() => handleMenuClick('addPerson')}>
            Kişi Ekle
          </div>
          <button style={styles.button} onClick={adminLogout}>Çıkış Yap</button>
        </div>
        </div>
      )}

      <div style={styles.mainContent}>
        {isLoading ? (
          <RingLoader size={150} color={"#123abc"} loading={isLoading} />
        ) : (
          renderContent() // Render content based on selected menu
        )}
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f0f0f0', // Gray background color
    position: 'relative', // Ensure the page content is positioned correctly
  },
  menuIcon: {
    fontSize: '2em',
    cursor: 'pointer',
    padding: '10px',
    position: 'absolute',
    top: '10px',
    left: '20px',
    zIndex: 1000, // Ensure it stays on top
  },
  sidebarOverlay: {
    position: 'fixed', // Sidebar is fixed on top of the page
    top: 0,
    left: 0,
    width: '100%', // Fullscreen overlay
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background to overlay the content
    zIndex: 999, // Ensures it sits on top of the main content
  },
  sidebar: {
    position: 'fixed',
    width: '250px',
    height: '100%',
    backgroundColor: '#2c3e50', // Dark background for the sidebar
    color: '#ecf0f1', // Light text color
    padding: '80px 20px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)', // Add subtle shadow
    transition: 'transform 0.3s ease', // Animation for opening/closing
  },
  sidebarItem: {
    padding: '15px',
    marginBottom: '10px',
    fontSize: '1.2em',
    cursor: 'pointer',
    backgroundColor: '#34495e', // Default background for sidebar items
    borderRadius: '5px',
    textAlign: 'center',
    transition: 'background-color 0.3s',
  },
  sidebarItemActive: {
    backgroundColor: '#1abc9c', // Active item background
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '800px',
    margin: '20px auto',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    background: '#fff',
  },
  restaurantName: {
    marginBottom: '20px',
    fontSize: '2em',
    color: '#2c3e50',
  },
  info: {
    marginTop: '5px',
    fontSize: '1.2em',
  },
  selectContainer: {
    display: 'flex',
    alignItems: 'center',
    margin: '5px 0',
    fontSize: '1.2em',
  },
  label: {
    marginRight: '10px',
  },
  select: {
    padding: '8px',
    fontSize: '1em',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  userList: {
    margin: '20px 0',
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #ddd',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  logoutButton: {
    fontSize: '1em',
    padding: '10px',
    marginTop: '20px',
    borderRadius: '10px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    cursor: 'pointer',
    textAlign: 'center',
    border: 'none',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#fff',
  },
  input: {
    margin: '10px 0',
    padding: '10px',
    fontSize: '1em',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '100%',
    maxWidth: '300px',
  },
  addButton: {
    fontSize: '1em',
    padding: '10px',
    marginTop: '10px',
    borderRadius: '10px',
    backgroundColor: '#1abc9c',
    color: '#fff',
    cursor: 'pointer',
    border: 'none',
  },
  button: {
    fontSize: '1em',
    padding: '10px',
    margin: '5px',
    borderRadius: '10px',
    background: '#3498db',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  menuItem: {
    fontSize: '1em',
    margin: '10px',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    margin: '20px 0',
    padding: '10px',
  },
  restaurantDetails: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: '20px',
    padding: '20px',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '10px',
  },
  centeredInputCell: {
    textAlign: 'center',
    paddingTop: '10px',
    paddingBottom: '10px',
  },
  override: {
    display: 'block',
    margin: '0 auto',
    borderColor: 'red',
  },
  mainContent: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto', // Scrollable content
  },
  actionButton: {
    fontSize: '1em', 
    padding: '10px', 
    marginTop: '-5px',
    margin: '10px', 
    borderRadius: '10px', 
    border: '2px solid #000'
  },
};

export default AdminPage;