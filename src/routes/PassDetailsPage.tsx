import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './PassDetailsPage.css';
import Button from '../components/Button';
import { Calendar } from 'lucide-react';
import { Clock } from 'lucide-react';
import { MapPin } from 'lucide-react';
import { Users } from 'lucide-react';
import { ShieldUser } from 'lucide-react';

interface GraphQLEvent {
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
}

function PassDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [pass, setPass] = useState<PassData | null>(null);
  const [loading, setLoading] = useState(true);
  // const [formData, setFormData] = useState({ name: '', email: '' });
  // const [message, setMessage] = useState('');

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
          events {
            title
            description
            datetime
            image {
            url
            alternativeText
            }
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

        const json: EventsQueryResponse  = await res.json();

        const event = json.data.events.find((e) => e.slug === id);

        if (!event) {
          setPass(null);
          return;
        }

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


  if (loading) return <p role="status">Laddar passdetaljer...</p>;
  if (!pass) return <p role="alert">Hittar inga nya pass.</p>;

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
      </section>
    </main>
  );
}

export default PassDetailsPage;
