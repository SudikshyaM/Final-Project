import React, { useState, useEffect } from 'react';
import '../styles/bookinghistory.css';
import { BASE_URL } from '../utils/config';

const BookingHistory = ({ userId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Replace with your API endpoint
        const response = await fetch(`${BASE_URL}/bookings/bookings-history/`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                  }
                });
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <p>Loading booking history...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="booking-history">
      <h2>Booking History</h2>
      {bookings.length > 0 ? (
        <ul className="booking-list">
          {bookings.map((booking, index) => (
            <li key={index} className="booking-item">
              <div className="booking-details">

                <h3>Package:{booking.package}</h3>
                <p><strong>Booking Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
                {/* <p><strong>Hotel:</strong> {booking.hotel}</p>
                <p><strong>Activities:</strong></p>
                <ul className="activities-list">
                  {booking.activities.map((activity, idx) => (
                    <li key={idx}>{activity}</li>
                  ))} */}
                {/* </ul> */}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
};

export default BookingHistory;