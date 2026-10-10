// Single source of truth for the legal entity and team shown on the site.
// To add Maria's photo: put the file at public/team/maria-vindell.jpg and set photo below.

export const SITE = 'https://craftora.dev';

export const COMPANY = {
  brand: 'Craftora',
  legalName: 'GE Promo Hub LLC',
  state: 'Florida',
  street: '4251 Mahogany Run',
  city: 'Winter Haven',
  region: 'FL',
  postal: '33884',
  country: 'US',
  countryName: 'USA',
  email: 'maria@craftora.dev',
  supportEmail: 'support@craftora.dev',
  twitter: 'craftoraaa',
  logo: '/og-image.png',
};

// Set this to the live campaign link when the Kickstarter page is public.
export const KICKSTARTER_URL = '';

export const OWNER = {
  name: 'Maria Vindell',
  title: 'Founder and CEO',
  email: 'maria@craftora.dev',
  instagram: 'maria.vindell',
  photo: null, // e.g. '/team/maria-vindell.jpg'
  bio: 'Maria leads Craftora and GE Promo Hub LLC from Florida. She oversees operations, partnerships, and customer support, and makes sure every Craftora tool stays free, fast, and private.',
};

export const addressLine = `${COMPANY.street}, ${COMPANY.city}, ${COMPANY.region} ${COMPANY.postal}, ${COMPANY.countryName}`;
export const twitterUrl = `https://x.com/${COMPANY.twitter}`;
export const instagramUrl = `https://www.instagram.com/${OWNER.instagram}/`;
export const ORG_ID = `${SITE}/#organization`;
export const OWNER_ID = `${SITE}/about#maria-vindell`;

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: COMPANY.brand,
    legalName: COMPANY.legalName,
    url: SITE,
    logo: `${SITE}${COMPANY.logo}`,
    email: COMPANY.supportEmail,
    sameAs: [twitterUrl],
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.street,
      addressLocality: COMPANY.city,
      addressRegion: COMPANY.region,
      postalCode: COMPANY.postal,
      addressCountry: COMPANY.country,
    },
    founder: { '@id': OWNER_ID },
    contactPoint: [
      { '@type': 'ContactPoint', contactType: 'customer support', email: COMPANY.supportEmail, availableLanguage: ['English'] },
      { '@type': 'ContactPoint', contactType: 'business inquiries', email: COMPANY.email, availableLanguage: ['English'] },
    ],
  };
}

export function ownerSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': OWNER_ID,
    name: OWNER.name,
    jobTitle: OWNER.title,
    email: `mailto:${OWNER.email}`,
    worksFor: { '@id': ORG_ID },
    sameAs: [instagramUrl],
    ...(OWNER.photo ? { image: `${SITE}${OWNER.photo}` } : {}),
  };
}
