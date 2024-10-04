import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RingLoader } from "react-spinners"; // Import the spinner component
import cat from "../cat-tail.gif"

const JoinPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // State to control loading state
  const [errors, setErrors] = useState({});
  const [averageWaitTime, setAverageWaitTime] = useState(null);
  const [queueSize, setQueueSize] = useState(null);
  const [numberOfPeople, setNumberOfPeople] = useState({}); // State to store the selected number of people
  const [numberOptions, setNumberOptions] = useState([]); // State to store the list of available number options
  const [userLocation, setUserLocation] = useState(null);
  const [isWithinDistance, setIsWithinDistance] = useState(false);
  const [restaurantName, setRestaurantName] = useState([]);
  const [totalWaitTime, setTotalWaitTime] = useState([]);
  const [countryCodes, setCountryCodes] = useState([
    { code: '+90', name: '' , numOfDigits: 12},
    { code: '+39', name: '' , numOfDigits: 12},
    // Add more country codes and names as needed
  ]);
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[0].code);

  var hashedId = 'f5b51a833fdea5c55d8ce43127c00356ec1b888442fc878b064b911e6d31c23c6951a5ccf06147e268e309e9fac1718100278e104d17d4b71db9b16c5a999902'
  //TO-DO: ana web sitesi mobil uyumlu olmalı - sonradan gelistirilebilir

  function handleCountryCodeChange(event) {
    setSelectedCountryCode(event.target.value);
  }

  function isValidPhoneNumber(phone, count) {
    const cleanedPhone = phone.replace(/\s+/g, '');
    // The regex pattern to validate phone numbers based on the count.
    const phonePattern = getPhonePattern(count);
    //TO-DO: Tab ismi react-app && bi alt satırdaki return true'yu düzelt
    //TO-DO: Hoşgeldin yazısı fadeout olarak gelsin falan filan yani 
    //TO-DO: Süre için aralık ???
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

  function getRestaurantIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('restaurantid');
  }

  async function checkQueueStatus() {
    if(getCookie('sessionid') != "null" && getCookie('sessionid') != null) {
      navigate('/queue-page?session=' + getCookie('sessionid'))
    } else {
    if (window.location.href.includes('restaurantid=')) {
      setIsLoading(true);
    const userData = {
      restaurantid: getRestaurantIdFromUrl()
    };
    try {
      const response = await fetch(process.env.REACT_APP_SERVER_URL + '/checkQueueStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
  
      if (response.ok) {
        const data = await response.json();
        const queueOpen = data.queueOpen;
        const averageWaitTime = data.averageWaitTime;
        const queueSize = data.queueSize;
        const availableNumbers = data.availableNumbers;
        const restaurantName = data.restaurantName;
        setRestaurantName(restaurantName)
        const formSection = document.getElementById('formSection');
        const closedMessage = document.getElementById('closedMessage');
        if (queueOpen == 1) {
          // If the queue is open, hide the closed message and show the form section.
          setAverageWaitTime(averageWaitTime);
          setQueueSize(queueSize);
          setTotalWaitTime(queueSize * parseInt(data.averageWaitTime))
          let number = []
          for (let i = 1; i < availableNumbers + 1; i++) {
              number[i] = i
          }
          setNumberOptions(number);
          formSection.style = styles.formSection
          closedMessage.style.display = 'none';
        } else {
          // If the queue is closed, hide the form section and show the closed message.
          formSection.style.display = 'none';
          closedMessage.style.display = 'block';
        }
        setIsLoading(false); // Set loading state to false when you have the response data
      } else {
        console.error('Failed to check queue status:', response);
        setIsLoading(true); // Make sure to set loading state to false in case of errors
      }
    } catch (error) {
      console.error('Error during queue status check:', error);
      setIsLoading(true); // Make sure to set loading state to false in case of errors
    }
  } } }

  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }

   // Function to read a cookie by name
   function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // Function to get the user's location using geolocation API.
  function getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setIsWithinDistance(true)
          console.error('Error getting user location:', error);
        }
      );
    } else {
      setIsWithinDistance(true)
      console.error('Geolocation is not supported by this browser.');
    }
  }

  // Function to calculate the distance between two locations (in this case, user and restaurant).
  function calculateDistance(lat1, lon1, lat2, lon2) {
    // You can use any formula to calculate the distance. Here, I'm using a simple approximation.
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  async function joinQueue() {
    // Only proceed with the reservation if the user is within the desired distance.
    if (!isWithinDistance) {
      alert('Üzgünüz, rezervasyon yapmak için restorana olan mesafeniz çok fazla.');
      return;
    }

    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const phone = selectedCountryCode + document.getElementById('phone').value; 
    const numOfPeople = document.getElementById('numOfPeople').value;
    const agree = document.getElementById('agree').checked;

    const userData = {
      name: name,
      surname: surname,
      phone: phone,
      numOfPeople: numOfPeople,
      restaurantid: getRestaurantIdFromUrl()
    };

    const validationErrors = {};

    if (!name || !surname || !phone || !numOfPeople) {
      if (!name) {
        validationErrors.name = 'İsim giriniz.';
      }

      if (!surname) {
        validationErrors.surname = 'Soyisim giriniz.';
      }

      if (!phone) {
        validationErrors.phone = 'Telefon giriniz.';
      }

      if (!numOfPeople) {
        validationErrors.numOfPeople = 'Kişi sayısı giriniz.';
      }

      setErrors(validationErrors);
    }

    if (!isValidPhoneNumber(phone.substring(1), countryCodes[0].numOfDigits)) {
      console.log(phone.substring(1) + " " + countryCodes[0].numOfDigits)
      validationErrors.phone = 'Geçerli bir telefon giriniz.';
      setErrors(validationErrors);
    }

    if (!agree) {
      validationErrors.checkBox = 'Onaylamanız gerekmektedir.';
      setErrors(validationErrors);
    }

    if (Object.keys(validationErrors).length === 0) {
      try {
        setErrors('');
    
            // Redirect to the queue.html page upon successful submission.
        const response = await fetch(process.env.REACT_APP_SERVER_URL + '/joinWaitlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (response.ok) {
          // Redirect to the queue.html page upon successful submission.,
          let sessionid = data.data[1]
          setCookie('sessionid', sessionid, (1/24));
          navigate('/queue-page?session=' + sessionid, { state: { sessionid } })
        } else {
          console.error('Error submitting form:', response);
          validationErrors.phone = 'Bu telefonla kullanıcı sırada.';
          setErrors(validationErrors);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
      }
    }
  }

  useEffect(() => {
    document.title = 'Sıraya Gir';
    // Call the checkQueueStatus function when the component mounts.
    if (!window.location.href.includes('restaurantid')) navigate('/join-page?restaurantid=' + hashedId)
    getUserLocation();
    checkQueueStatus();
  }, []);

  function handleNumberOfPeopleChange(event) {
    setNumberOfPeople(parseInt(event.target.value));
  }

  useEffect(() => {
    // Call the checkQueueStatus function when the component mounts.
    setIsLoading(false);
  }, [restaurantName]);

  // useEffect to check if the user is within the desired distance from the restaurant.
  useEffect(() => {
    if (userLocation) {
      // Replace 'YOUR_RESTAURANT_LATITUDE' and 'YOUR_RESTAURANT_LONGITUDE' with the actual coordinates of the restaurant.
      const restaurantLatitude = 1;
      const restaurantLongitude = 1;
      const userLatitude = userLocation.latitude;
      const userLongitude = userLocation.longitude;

      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        restaurantLatitude,
        restaurantLongitude
      );

      // Set the state variable to indicate if the user is within the desired distance (e.g., 2 km).
      setIsWithinDistance(distance <= 2); // Change '2' to your desired distance threshold in kilometers.
    }
  }, [userLocation]);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <h2 id = "restaurantName" style={styles.restaurantName}>{restaurantName}</h2>
        {isLoading ? (
          // Show the spinner while loading
          <img src={cat} alt="Loading..." style={{ marginTop: '-10px'}}/>
        ) : (
          <div>
          <div id="formSection" style={{ ...styles.formSection, ...styles.centered }}>
          <div style={styles.queueForm}>
            {averageWaitTime && (
              <div>
                <p>Ortalama Bekleme Süresi: {Number(totalWaitTime) < 15 ? 0 : Number(totalWaitTime) - 15} - {Number(totalWaitTime) + 15} dakika</p>
                <p>Sıradaki Rezervasyon Sayısı: {queueSize}</p>
                <p>Süreler tahminidir. Değişiklik gösterebilir.</p>
              </div>
            )}
            <div style={{ ...styles.centered, marginBottom: '0px', fontSize: '1em', padding: '0px' }}>
            <input type="text" id="name" className={errors.name ? 'error' : ''} placeholder="İsminiz" required style={{ width: '103%', flex: 2, margin: '10px', marginLeft: '-10px', marginTop: '20px', fontSize: '1em', padding: '10px', borderColor: errors.name ? 'red' : '' , borderRadius: '10px'}} />
            {errors.name && <p style={{marginTop: '-10px', marginBottom: '0px', color: 'red' }}>{errors.name}</p>}
            <input type="text" id="surname" className={errors.surname ? 'error' : ''} placeholder="Soyisminiz" required style={{ width: '103%', flex: 1, margin: '10px', marginLeft: '-10px', fontSize: '1em', padding: '10px', borderColor: errors.surname ? 'red' : '' , borderRadius: '10px'}} />
            {errors.surname && <p style={{marginTop: '-10px', marginBottom: '0px', color: 'red' }}>{errors.surname}</p>}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '0px', fontSize: '1em', padding: '0px' }}>
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
              placeholder="Telefonunuz"
              required
              style={{
                flex: 1,
                margin: '10px',
                fontSize: '1em',
                padding: '10px',
                borderColor: errors.phone ? 'red' : '',
                borderRadius: '10px',
              }}
            />
            </div>
            {errors.phone && <p style={{ marginTop: '-10px', marginBottom: '0px', color: 'red' }}>{errors.phone}</p>}
            <div>
              <label style={{ margin: "10px", fontSize: "1em" }}>Kişi Sayısı:</label>
              <select
                id= "numOfPeople"
                value={numberOfPeople}
                onChange={handleNumberOfPeopleChange}
                required
                style={{ margin: "10px", fontSize: "1em", padding: "10px" }}
              >
                {numberOptions.map((number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))}
              </select>
            </div>
            {errors.numOfPeople && <p style={{ marginTop: '0px', marginBottom: '0px', color: 'red' }}>{errors.numOfPeople}</p>}
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '10px', fontSize: '1em', paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
              <label htmlFor="agree" style={{ margin: '0' }}>
                Telefon numaramın kullanılmasına onay veriyorum:
              </label>
              <div className="customCheckbox">
                <input type="checkbox" id="agree" className={errors.checkBox ? 'error' : ''} required  />
                <div className="checkboxIndicator"></div>
              </div>
            </div>
            {errors.checkBox && <p style={{marginTop: '-20px', marginBottom: '0px', color: 'red' }}>{errors.checkBox}</p>}
            <button style={{ fontSize: '1em', padding: '10px', marginTop: '10px', borderRadius: '10px', border: '2px solid #000'}} onClick={joinQueue}>Sıraya Gir</button>
          </div>
        </div>
        <div id="closedMessage" style={{ display: 'none' }}>
          <p>Sıra kapalı. Restoran ile iletişime geçiniz.</p>
        </div>
          </div>
        )}
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
    //minHeight: '80vh',
    //margin: '0px',
    //overflow: 'hidden',
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
    padding: '20px', // Add some padding to improve mobile layout
    borderRadius: '10px', // Add rounded corners for better aesthetics
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', // Add a subtle shadow for depth
    background: '#fff', // Add a background color
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    display: 'block'
  },
  restaurantName: {
    marginBottom: '20px', // Add some spacing between the restaurant name and the form
    marginTop: '0px',
    // Add any styles for the restaurant name
  },
  formSection: {
    // Add any styles for the form section
  },
  queueForm: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: '300px', // Limit the form's width for better mobile layout
  },
  override: {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  },
};

export default JoinPage;
