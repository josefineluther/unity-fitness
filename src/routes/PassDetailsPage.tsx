import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './PassDetailsPage.css';
import Button from '../components/Button';
import { Calendar, Clock, MapPin, Users, ShieldUser } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';

interface GraphQLEvent {
  id: string;
  title: string;
  description?: string;
  datetime: string;
  slug: string;
  spots: number;
  minutes: number;
  image?: {
    url: string;
    alternativeText?: string | null;
  } | null;
  event_categories?: {
    name: string;
  }[];
  instructor?: { name: string };
  studio?: { name: string };
}

interface EventsQueryResponse {
  data: {
    events: GraphQLEvent[];
  };
}

interface PassData {
  image?: {
    url: string;
    alternativeText?: string | null;
  } | null;
  title: string;
  description?: string;
  category?: string;
  datetime: string;
  minutes: number;
  instructor: string;
  place: string;
  spots: number;
  slug?: string;
}

function PassDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [pass, setPass] = useState<PassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [message, setMessage] = useState('');
  const [eventId, setEventId] = useState<number | null>(null);
  const [isBooked, setIsBooked] = useState(false);

  const date = pass
    ? new Date(pass.datetime).toLocaleDateString('sv-SE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const time = pass
    ? new Date(pass.datetime).toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  useEffect(() => {
    async function fetchPass() {
      try {
        const query = `
        query {
          events(pagination: { limit: 100 }) {
            title
            description
            datetime
            image {
            url
            alternativeText
            }
            event_categories { name }
            slug
            spots
            minutes
            instructor {name}
            studio {name}
          }
        }
      `;

        const res = await fetch(
          'https://competent-addition-09352633f0.strapiapp.com/graphql',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          }
        );

        const json: EventsQueryResponse = await res.json();

        const event = json.data.events.find((e) => e.slug === id);

        if (!event) {
          setPass(null);
          return;
        }

        setEventId(event.id as unknown as number);

        setPass({
          image: event.image ?? null,
          title: event.title,
          description: event.description,
          category: event.event_categories?.[0]?.name || 'Allmänt',
          datetime: event.datetime,
          minutes: event.minutes,
          spots: event.spots,
          instructor: event.instructor?.name ?? 'Okänd instruktör',
          place: event.studio?.name ?? 'Okänd studio',
        });
      } catch (err) {
        console.error(err);
        setPass(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPass();
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage('Vänligen fyll i alla fält.');
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Vänligen ange en giltig email.');
      return;
    }

    setMessage('Skickar bokning...');

    try {
      const res = await fetch(
        'https://competent-addition-09352633f0.strapiapp.com/api/bookings',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: {
              customer_name: formData.name,
              customer_email: formData.email,
              event: eventId,
            },
          }),
        }
      );

      if (res.ok) {
        setMessage('Bokning genomförd!');
        setFormData({ name: '', email: '' });
        setIsBooked(true);
      } else throw new Error('Bokning misslyckades');
    } catch (error) {
      console.error(error);
      setMessage('Något gick snett. Testa igen senare. ');
    }
  }

  if (loading)
    return (
      <div className="skeleton">
        <Skeleton height="40rem" width="60%" style={{ marginBottom: '10px' }} />
      </div>
    );
  if (!pass) return <p role="alert">Kan inte hitta passet du söker.</p>;

  return (
    <main className="pass-details" aria-labelledby="pass-title">
      <div className="pass-wrapper">
        <div className="media-wrapper">
          {pass.image && (
            <img
              src={pass.image.url}
              alt={pass.image.alternativeText || pass.title}
              className="pass-image"
            />
          )}
          <div className="media-overlay">
            <span className="category-badge">{pass.category}</span>
          </div>
        </div>
        <h1 id="pass-title">{pass.title}</h1>
        {pass.description && <p className="desc">{pass.description}</p>}

        <section className="info-grid">
          <ul>
            <li className="info-card">
              <Calendar className="icon" color="#1d468d" size={30} />
              <strong>Datum:</strong> {date}
            </li>
            <li className="info-card">
              <Clock className="icon" color="#1d468d" size={30} />
              <strong>Tid & längd:</strong> {time} ({pass.minutes} min)
            </li>
            <li className="info-card">
              <MapPin className="icon" color="#1d468d" size={30} />
              <strong>Plats:</strong> {pass.place}
            </li>
            <li className="info-card">
              <Users className="icon" color="#1d468d" size={30} />
              <strong>Tillgängliga platser:</strong> {pass.spots}
            </li>
            <li className="info-card">
              <ShieldUser className="icon" color="#1d468d" size={30} />
              <strong>Instruktör:</strong> {pass.instructor}
            </li>
          </ul>
        </section>
      </div>

      <section className="booking" aria-labelledby="booking-title">
        {isBooked ? (
          <>
            <p role="status" className="message">
              {message}
            </p>
            <Button
              text="Boka på nytt"
              onClick={() => {
                setIsBooked(false);
                setMessage('');
                setFormData({ name: '', email: '' });
              }}
            />
          </>
        ) : (
          <>
          <h2 id="booking-title">Boka {pass.title}:</h2>
            <p>Fyll i dina uppgifter för att slutföra bokningen.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">För- och efternamn:</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button text="Slutför bokning" type="submit" />
              {message && (
                <p role="status" className="message">
                  {message}
                </p>
              )}
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default PassDetailsPage;
