import { baseUrl } from './apiConfig';

// GET events
export const getUserEvents = async (userId) => {
  const res = await fetch(`${baseUrl}/events/${userId}`);

  if (!res.ok) {
    throw new Error('Failed to fetch events');
  }

  return res.json();
};

// POST event
export const createEvent = async (event) => {
  const eventPayload = {
    userId: event.userId,
    type: event.type,
    data: typeof event.data === 'string' ? event.data : JSON.stringify(event.data),
  };

  const res = await fetch(`${baseUrl}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!res.ok) {
    throw new Error('Failed to create event');
  }

  return res.json();
};

// ⭐ CLEAN HELPER (ВАЖНО)
export const logEvent = async (userId, type, data = {}) => {
  try {
    return await createEvent({
      userId,
      type,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Event logging failed:', err);
  }
};

export const logGeoEvent = async (userId) => {
  if (!userId) {
    throw new Error('Missing userId when logging geo event');
  }

  if (!navigator?.geolocation) {
    return await createEvent({
      userId,
      type: 'geo',
      data: {
        location: 'Unavailable',
        reason: 'geolocation_not_supported',
      },
      timestamp: new Date().toISOString(),
    });
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          const geoData = {
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            latitude,
            longitude,
            accuracy,
            rawType: 'GEOLOCATION-POSITION-DRJ',
          };

          const result = await createEvent({
            userId,
            type: 'geo',
            data: geoData,
            timestamp: new Date().toISOString(),
          });
          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
      async (error) => {
        try {
          const result = await createEvent({
            userId,
            type: 'geo',
            data: {
              location: 'Unknown',
              error: error?.message || 'Geolocation denied',
            },
            timestamp: new Date().toISOString(),
          });
          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  });
};