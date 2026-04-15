import { useEffect, useMemo, useState } from 'react';
import { getUserEvents, createEvent, logGeoEvent } from '../services/eventsService';
import { useAuth } from '../context/AuthContext';

const eventTypeMeta = [
  { key: 'quiz', label: 'Quiz', icon: '🧠', color: '#7c5cff' },
  { key: 'chatbot', label: 'Chatbot', icon: '🤖', color: '#ff8c42' },
  { key: 'profile', label: 'Profile', icon: '👤', color: '#00c2a0' },
  { key: 'achievement', label: 'Achievement', icon: '🏆', color: '#ffd166' },
  { key: 'geo', label: 'Geo', icon: '📍', color: '#0096c7' },
  { key: 'timeline', label: 'Milestone', icon: '✨', color: '#8e44ad' },
];

const getEventMeta = (type) => {
  if (!type) return null;
  const normalized = type.toLowerCase();
  return eventTypeMeta.find((meta) => normalized.includes(meta.key)) ?? null;
};

export default function TimelinePage() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [milestoneText, setMilestoneText] = useState('');
  const [milestoneType, setMilestoneType] = useState('achievement');
  const [savingMilestone, setSavingMilestone] = useState(false);
  const [loggingLocation, setLoggingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  const { userId } = useAuth();

  useEffect(() => {
    if (userId) {
      loadEvents();
      const interval = setInterval(loadEvents, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [userId]);

  const parseEventData = (rawData) => {
    if (rawData == null) return null;
    if (typeof rawData !== 'string') return rawData;
    try {
      return JSON.parse(rawData);
    } catch (error) {
      return rawData;
    }
  };

  const normalizeEvent = (event) => ({
    ...event,
    type: event.type ?? event.Type,
    timestamp:
      event.timestamp ??
      event.Timestamp ??
      event.datetimeUtc ??
      event.DatetimeUtc,
    data: parseEventData(event.data ?? event.Data),
  });

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getUserEvents(userId);
      const normalizedEvents = (data || []).map(normalizeEvent);
      const sorted = normalizedEvents.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setEvents(sorted);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Timeline error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatEventData = (type, data) => {
    const eventData = typeof data === 'string' ? parseEventData(data) : data;
    if (!eventData) return 'No data';

    if (type?.includes('quiz')) {
      return `Scored ${eventData.score}% on quiz (${eventData.correct}/${eventData.totalQuestions} correct)`;
    }

    if (type?.includes('chatbot')) {
      return `Completed chatbot session with ${eventData.answers?.length || 0} answers`;
    }

    if (type?.includes('profile-login')) {
      return eventData.message || 'Logged in successfully';
    }

    if (type?.includes('profile')) {
      return eventData.message || 'Profile updated';
    }

    if (type?.includes('achievement')) {
      return eventData.title ? `Achievement unlocked: ${eventData.title}` : 'Achievement unlocked';
    }

    if (type?.includes('geo')) {
      if (eventData.location && eventData.latitude != null && eventData.longitude != null) {
        return `Location updated: ${eventData.location} (±${eventData.accuracy ?? 'n/a'}m)`;
      }
      return `Location updated: ${eventData.location || 'Unknown'}`;
    }

    if (eventData.note) {
      return eventData.note;
    }

    return JSON.stringify(eventData, null, 2);
  };

  const getIcon = (type) => getEventMeta(type)?.icon ?? '📝';

  const getCardColor = (type) => getEventMeta(type)?.color ?? '#64748b';

  const filteredEvents =
    filter === 'all'
      ? events
      : events.filter((e) => e.type?.includes(filter));

  const eventSummary = useMemo(() => {
    const counts = events.reduce((acc, event) => {
      const label = getEventMeta(event.type)?.label ?? 'Other';
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});

    return {
      total: events.length,
      counts,
      lastEvent: events[0] || null,
    };
  }, [events]);

  const handleSaveMilestone = async () => {
    if (!milestoneText.trim() || !userId) return;

    setSavingMilestone(true);
    try {
      await createEvent({
        userId,
        type: milestoneType,
        data: { note: milestoneText.trim() },
        timestamp: new Date().toISOString(),
      });
      setMilestoneText('');
      setFilter('all');
      await loadEvents();
    } catch (error) {
      console.error('Milestone save failed:', error);
    } finally {
      setSavingMilestone(false);
    }
  };

  const handleLogLocation = async () => {
    if (!userId) return;

    setLoggingLocation(true);
    setLocationStatus('Logging current location...');

    try {
      await logGeoEvent(userId);
      setLocationStatus('Location event logged successfully.');
      setFilter('all');
      await loadEvents();
    } catch (error) {
      console.error('Geo logging failed:', error);
      setLocationStatus(`Location logging failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoggingLocation(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>📊 Interactive Timeline</h1>
      {lastUpdate && (
        <p style={{ fontSize: '12px', color: 'gray' }}>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      )}

      <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div
          style={{
            background: '#0f172a',
            color: 'white',
            padding: '16px',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(15,23,42,0.08)',
          }}
        >
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.7 }}>
            Timeline Summary
          </div>
          <div style={{ marginTop: '10px', fontSize: '32px', fontWeight: '700' }}>{eventSummary.total}</div>
          <div style={{ marginTop: '8px', color: '#cbd5e1' }}>
            Total events captured for your learning journey.
          </div>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {Object.entries(eventSummary.counts).map(([label, count]) => (
            <div
              key={label}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: '600' }}>{label}</span>
              <span style={{ fontSize: '14px', color: '#475569' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'quiz', 'chatbot', 'profile', 'achievement', 'geo', 'timeline'].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '10px 16px',
              borderRadius: '999px',
              border: '1px solid #cbd5e1',
              background: filter === key ? '#2563eb' : 'white',
              color: filter === key ? 'white' : '#0f172a',
              cursor: 'pointer',
              fontWeight: filter === key ? '700' : '500',
            }}
          >
            {key === 'all' ? 'All' : getEventMeta(key)?.label ?? key}
          </button>
        ))}

        <button
          onClick={loadEvents}
          disabled={loading}
          style={{
            padding: '10px 16px',
            borderRadius: '999px',
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          🔄 Refresh
        </button>

        <button
          onClick={handleLogLocation}
          disabled={loggingLocation || !userId}
          style={{
            padding: '10px 16px',
            borderRadius: '999px',
            border: '1px solid #cbd5e1',
            background: loggingLocation ? '#f1f5f9' : '#e0f2fe',
            color: '#0f172a',
            cursor: loggingLocation ? 'not-allowed' : 'pointer',
          }}
        >
          📍 {loggingLocation ? 'Logging location…' : 'Log current location'}
        </button>

      </div>

      {locationStatus && (
        <p style={{ fontSize: '13px', color: '#475569', marginTop: '-8px', marginBottom: '16px' }}>
          {locationStatus}
        </p>
      )}


      <div
        style={{
          marginBottom: '24px',
          padding: '18px',
          background: '#f8fafc',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ fontWeight: '700', marginBottom: '10px' }}>✨ Add a personalized milestone</div>
        <div style={{ display: 'grid', gap: '12px' }}>
          <select
            value={milestoneType}
            onChange={(e) => setMilestoneType(e.target.value)}
            style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
          >
            {eventTypeMeta.map((meta) => (
              <option key={meta.key} value={meta.key}>
                {meta.label}
              </option>
            ))}
          </select>

          <textarea
            rows={3}
            value={milestoneText}
            onChange={(e) => setMilestoneText(e.target.value)}
            placeholder="Describe your milestone, e.g. completed a major module, updated profile, or answered new questions"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid #cbd5e1',
              resize: 'vertical',
            }}
          />

          <button
            onClick={handleSaveMilestone}
            disabled={savingMilestone || !milestoneText.trim()}
            style={{
              width: 'fit-content',
              padding: '12px 18px',
              borderRadius: '12px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              cursor: savingMilestone || !milestoneText.trim() ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            {savingMilestone ? 'Saving…' : 'Save Milestone'}
          </button>
        </div>
      </div>

      {loading && <p>Loading events…</p>}

      {!loading && events.length === 0 && (
        <p>No events yet. Start exploring the app to see your timeline grow 🚀</p>
      )}

      {!loading && events.length > 0 && (
        <div style={{ display: 'grid', gap: '18px' }}>
          {filteredEvents.map((event) => {
            const color = getCardColor(event.type);
            const label = getEventMeta(event.type)?.label ?? event.type;
            const note = event.data?.note || null;

            return (
              <div
                key={event.id}
                style={{
                  position: 'relative',
                  padding: '18px 20px',
                  borderRadius: '20px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 12px 30px rgba(15,23,42,0.06)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '-12px',
                    top: '24px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: color,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '700' }}>
                      <span>{getIcon(event.type)}</span>
                      <span>{label}</span>
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '13px', color: '#64748b' }}>
                      {event.timestamp
                        ? new Date(event.timestamp).toLocaleString()
                        : 'No timestamp'}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '999px',
                      background: color,
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '700',
                    }}
                  >
                    {event.type?.toUpperCase()}
                  </div>
                </div>

                <div style={{ marginTop: '16px', lineHeight: '1.7', color: '#334155' }}>
                  {formatEventData(event.type, event.data)}
                </div>

                {note && (
                  <div
                    style={{
                      marginTop: '14px',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                    }}
                  >
                    <strong>Note:</strong> {note}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
