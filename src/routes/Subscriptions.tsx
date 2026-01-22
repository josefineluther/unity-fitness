import { useEffect, useState } from 'react';
import './Subscriptions.css';
import Button from '../components/Button';
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';

interface EventImage {
  url: string;
  alternativeText?: string;
}

interface Event {
  image: EventImage;
}

export default function SubscriptionsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPass() {
      try {
        const query = `
          query {
            events {
              image {
                url
                alternativeText
              }
            }
          }
        `;

        const res = await fetch(
          'https://competent-addition-09352633f0.strapiapp.com/graphql',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          },
        );

        const json = await res.json();
        setEvents(json.data.events);
      } catch (error) {
        console.error('Kunde inte hämta events', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPass();
  }, []);

  if (loading)
    return (
      <div className="skeleton">
        <Skeleton
          height="20rem"
          width="100%"
          style={{ marginBottom: '10px' }}
          baseColor='#dfebff' highlightColor='#f6f6f6'
        />
        <Skeleton
          height="20rem"
          width="100%"
          style={{ marginBottom: '10px' }}
          baseColor='#dfebff' highlightColor='#f6f6f6'
        />
        <Skeleton
          height="20rem"
          width="100%"
          style={{ marginBottom: '10px' }}
          baseColor='#dfebff' highlightColor='#f6f6f6'
        />
      </div>
    );

  return (
    <main className="page" aria-labelledby="page-title">
      <header className="page-header">
        <motion.h1
          id="page-title"
          className="page-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Våra medlemskap
        </motion.h1>
        <p className="page-intro">
          Ett gym för styrka, rörlighet och återhämtning. Välj det medlemskap
          som passar dig bäst.
        </p>
      </header>

      <section className="subscriptions" aria-label="Tillgängliga medlemskap">
        <SubscriptionCard
          title="Lugn Start"
          price="399 kr / mån"
          description="Perfekt för dig som vill komma igång med yoga, pilates och mjuk styrka."
          features={['Yoga & pilates', 'Guidad meditation', 'Tillgång dagtid']}
          image={events[0]?.image}
        />
        <SubscriptionCard
          title="Harmoni"
          price="549 kr / mån"
          description="Vår mest populära nivå. Balans mellan flöde, styrka och vila."
          features={['Alla Pass', 'Lugn styrketräning', 'Bastu & återhämtning']}
          highlighted
          image={events[1]?.image}
        />
        <SubscriptionCard
          title="Helhet"
          price="699 kr / mån"
          description="För dig som vill ha allt utan stress."
          features={[
            'Alla pass & tider',
            'Personlig introduktion',
            'Workshops & events',
          ]}
          image={events[9]?.image}
        />
      </section>

      <div className="terms">
        <p className="terms-text">
          Alla medlemskap är utan bindningstid. Uppsägning sker månadsvis.
        </p>
      </div>

      <section
        className="membership-guide"
        aria-labelledby="membership-guide-title"
      >
        <h2 id="membership-guide-title" className="section-title">
          Vilket medlemskap passar dig?
        </h2>
        <div className="comparison-table-wrapper">
          <div className="comparison-table">
            <div className="comparison-row header-row">
              <div className="feature-header">
                <h3>Jämför medlemskap</h3>
              </div>

              <div className="plan-header">
                <h3>Lugn Start</h3>
                <p>Dagtid & lugna pass</p>
              </div>

              <div className="plan-header highlighted">
                <h3>Harmoni</h3>
                <p>Balans & återhämtning</p>
              </div>

              <div className="plan-header">
                <h3>Helhet</h3>
                <p>Allt utan begränsningar</p>
              </div>
            </div>

            <div className="comparison-row">
              <div className="feature-cell">Tillgång dagtid</div>

              <div className="check"></div>
              <div className="check"></div>
              <div className="check"></div>
            </div>

            <div className="comparison-row">
              <div className="feature-cell expandable">
                <button className="feature-expand" aria-expanded="false">
                  Yoga & pilates
                </button>
              </div>

              <div className="check"></div>
              <div className="check"></div>
              <div className="check"></div>
            </div>

            <div className="comparison-row">
              <div className="feature-cell">Styrkepass</div>

              <div></div>
              <div className="check"></div>
              <div className="check"></div>
            </div>

            <div className="comparison-row">
              <div className="feature-cell">Bastu & återhämtning</div>

              <div></div>
              <div className="check"></div>
              <div className="check"></div>
            </div>

            <div className="comparison-row">
              <div className="feature-cell">Workshops & events</div>

              <div></div>
              <div></div>
              <div className="check"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="extras" aria-labelledby="extras-title">
        <h2 id="extras-title" className="section-title">
          Det lilla extra
        </h2>
        <p className="section-intro">
          Ibland är det de små detaljerna som gör störst skillnad. Med våra
          tillval kan du skapa en träningsupplevelse som känns genomtänkt hela
          vägen från första andetaget på mattan till stunden då du går hem igen.
          Välj det som förenklar din vardag, ger extra återhämtning eller bara
          låter dig stanna kvar i känslan lite längre.
        </p>

        <ul className="extras-list">
          <li className="extra-item">
            <h3>Frukost efter morgonpass</h3>
            <p>
              {' '}
              Efter ett morgonpass kan det vara skönt att få landa en stund
              innan dagen tar vid. Vår frukost serveras i en lugn miljö och är
              tänkt som en mjuk övergång. Något enkelt, närande och kravlöst att
              dela med andra eller njuta av i stillhet.
            </p>
            <Button text="Boka frukost" />
          </li>

          <li className="extra-item">
            <h3>Frotté</h3>
            <p>
              Med vår frottéservice finns allt på plats när du kommer. Handduk
              och badrock väntar på dig, så att du kan röra dig fritt och slippa
              bära med dig mer än nödvändigt. Ett litet stöd i vardagen som gör
              träningen lättare att prioritera.
            </p>
            <br />
            <Button text="Boka handduksservice" />
          </li>

          <li className="extra-item">
            <h3>Massage & återhämtning</h3>
            <p>
              Ibland behöver kroppen något mer än rörelse. Våra behandlingar
              fokuserar på återhämtning, cirkulation och avslappning, och
              anpassas efter hur du känner dig just nu. Ett tillfälle att stanna
              upp, släppa taget och ge kroppen tid att svara.
            </p>
            <Button text="Boka massage" />
          </li>
        </ul>
      </section>

      <section className="care-section" aria-labelledby="care-section-title">
        <h2 id="care-section-title" className="section-title">
          I trygga händer
        </h2>

        <p className="care-text">
          På Unity Fitness möts du av ett engagerat team som ser hela dig, inte
          bara din träning. Vi arbetar långsiktigt och med omtanke. Vi vill
          hjälpa dig att må bra i både kropp och sinne.
        </p>

        <p className="care-text">
          Hos oss finns kompetens inom träning, rörelse och återhämtning.
          Oavsett om du vill bygga styrka, hitta tillbaka till rörlighet eller
          bara skapa en hållbar rutin i vardagen, får du stöd som är anpassat
          efter dina behov och förutsättningar.
        </p>
      </section>
    </main>
  );
}

interface SubscriptionCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  image?: {
    url: string;
    alternativeText?: string;
  };
}

function SubscriptionCard({
  title,
  price,
  description,
  features,
  highlighted = false,
  image,
}: SubscriptionCardProps) {
  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      className={`subscription-card ${
        highlighted ? 'subscription-card--highlighted' : ''
      }`}
    >
      {image && (
        <img
          className="subscription-image"
          src={image.url}
          alt={image.alternativeText || ''}
        />
      )}
      <h2 className="subscription-title">{title}</h2>
      <p className="subscription-price">{price}</p>
      <p className="subscription-description">{description}</p>

      <ul className="subscription-features" aria-label="Detta ingår">
        {features.map((feature) => (
          <li key={feature} className="subscription-feature">
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button aria-label={`Välj medlemskap ${title}`} text="Välj medlemskap" />
    </motion.article>
  );
}
