import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import hourglass from "../icons8-hourglass.gif"
import cat from "../cat-tail.gif"
import { RingLoader } from "react-spinners"; // Import the spinner component
const QueuePage = () => {
  // Replace 'YOUR_BACKEND_URL' with the actual URL of your backend API.
  const backendUrl = 'YOUR_BACKEND_URL';

  // State to store queue data
  const [queueData, setQueueData] = useState([]);
  const [restaurantName, setRestaurantName] = useState([]);
  const [averageWaitTime, setAverageWaitTime] = useState([]);
  const [totalWaitTime, setTotalWaitTime] = useState([]);
  const [restaurantId, setRestaurantId] = useState([]);
  const [count, setCount] = useState([]);
  const [readyF, setReadyF] = useState([]);
  const [checkF, setCheckF] = useState([]);
  const [removedFromWaitlist, setRemovedFromWaitlist] = useState(false);
  const { state } = useLocation();
  const [isLoading, setIsLoading] = useState(false); // State to control loading state
  const navigate = useNavigate();

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

function getSessionIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  //alert(urlParams.get('session'))
  if(urlParams.get('session') != null){
    return urlParams.get('session');
  } else {
    return getCookie('sessionid');
  }
}


  // Function to fetch the queue data from the backend.
  async function getQueueData() {
    //setIsLoading(true);
    if(getCookie('sessionid') != null){
      try {
        const response = await fetch(process.env.REACT_APP_SERVER_URL + '/getWaitlistPosition?session=' + getCookie('sessionid'));
        if(response.ok) {
          const data = await response.json();
          setQueueData(data.queueData);
          setAverageWaitTime(data.averageWaitTime)
          setTotalWaitTime(data.queueData * parseInt(data.averageWaitTime))
          setRestaurantName(data.restaurantName)
          setRestaurantId(data.restaurantId)
          setReadyF(data.readyF)
          setCheckF(data.checkF)
          if(data.readyF == 1) {
            setRemovedFromWaitlist(true);
          }
          if(data.checkF == 1) {
            setCookie('sessionid', null, -1)
            navigate('/join-page?restaurantid=' + restaurantId)
          }
          //setIsLoading(false);
        } else {
          //setIsLoading(true);
        } 
      } catch (error) {
        console.error('Error fetching queue data:', error);
        //setIsLoading(true);
        return [];
      }
    } else {
      try {
        const response = await fetch(process.env.REACT_APP_SERVER_URL + '/getWaitlistPosition?session=' + getSessionIdFromUrl());
        if(response.ok) {
          const data = await response.json();
          setQueueData(data.queueData);
          setAverageWaitTime(data.averageWaitTime)
          setTotalWaitTime(data.queueData * parseInt(data.averageWaitTime))
          setRestaurantName(data.restaurantName)
          setRestaurantId(data.restaurantId)
          setReadyF(data.readyF)
          setCheckF(data.checkF)
          if(data.readyF == 2) setRemovedFromWaitlist(true);
          //setIsLoading(false);
        } else {
          //setIsLoading(true);
        } 
      } catch (error) {
        console.error('Error fetching queue data:', error);
        //setIsLoading(true);
        return [];
      }
    }
  }

  // Function to remove the user from the waitlist
  async function removeUser() {
    try {
       // Get the restaurant ID from the URL
        const userData = {
          sessionid: getSessionIdFromUrl()
        };
        const response = await fetch(process.env.REACT_APP_SERVER_URL + '/removeFromQueue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        setReadyF(2);
        setRemovedFromWaitlist(true);
        if (!response.ok) {
          console.error('Error deleting user details:', response);
          return;
        }

      // Redirect the user to the 'join.html' page after successful removal.
      navigate('/join-page?restaurantid=' + restaurantId)
    } catch (error) {
      console.error('Error deleting user details:', error);
    }
  }

  function navigateToJoinPage() {
    setCookie('sessionid', null, (1/24));
    navigate('/join-page?restaurantid=' + restaurantId)
  }

  // Function to get the restaurant ID from the URL
  function getRestaurantIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('restaurantId');
  }


  // useEffect to fetch restaurant details and update the page content
  useEffect(() => {
    document.title = 'Sıra Durumu';
    setIsLoading(true);
    getQueueData();
    setCount(0)
  }, []);

  useEffect(() => {
    // Call the checkQueueStatus function when the component mounts.
    setIsLoading(false);
  }, [restaurantName]);

  useEffect(() => {
    setTimeout(() => {
      setCount((count) => count + 1);
    }, 5000);
    getQueueData()
  }, [count]);

  return (
    <div style={styles.pageContainer}>

      {isLoading ? (
          // Show the spinner while loading
          <img src={cat} alt="Loading..." style={{ marginTop: '-10px'}}/>
        ) : (
          <div style={styles.container}>

{removedFromWaitlist && checkF == 2 ? (
    <>
       <h1 id="restaurantName" style={styles.restaurantName}>{restaurantName}</h1>
      <p>Artık sırada değilsiniz. Bir sorun olmuş ise restoran ile iletişime geçebilirsiniz.</p>
      <button style={styles.button} onClick={navigateToJoinPage}>
        Sıraya Gir
      </button>
    </>
  ) : (
    <>
      <h1 id="restaurantName" style={styles.restaurantName}>{restaurantName}</h1>
      <div>
        {readyF == 1 ? (<><p>🍽️ Sıranız geldi. Lütfen restorana doğru yola çıkın. Afiyet olsun! 😋</p></>) : (<><p>
      Sıranız: <span id="queueNumber">{queueData || 'N/A'}</span>
    </p>
    <p>
      <span id="turnText">
        {queueData.userTurn && readyF == 1? '🍽️ Sıranız geldi. Lütfen restorana doğru yola çıkın. Afiyet olsun! 😋' : 'Lütfen sıranızı bekleyiniz.'}
      </span>
    </p>
    <img src={hourglass} alt="waiting"/>
    <p id="averageWaitTime">
      {averageWaitTime
        ? 'Ortalama Bekleme Süresi: ' + (Number(totalWaitTime) < 15 ? 0 : Number(totalWaitTime) - 15) + ' - ' + (Number(totalWaitTime) + 15) + ' dakika'
        : 'Ortalama Bekleme Süresi: N/A'}
    </p>
    <p>Süreler tahminidir. Değişiklik gösterebilir.</p></>)} 
    </div>
    <button id="removeButton" style={styles.button} onClick={removeUser}>
      Sıradan Çık
    </button>
      </>
    )}
</div>
        )}
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
  },
  restaurantName: {
    marginBottom: '20px', // Add some spacing between the restaurant name and the form
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
  button: {
    fontSize: '1em',
    padding: '10px',
    marginTop: '10px',
    borderRadius: '10px', // Add the same borderRadius as the form container
    border: '2px solid #000',
  },
  override: {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  },
};

export default QueuePage;
