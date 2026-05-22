// Edit SITE_URL when the production domain is live (e.g. https://amercurycrackers.com).
// Set NEXT_PUBLIC_SITE_URL in Vercel to override per environment.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://amercurycrackers.com";

export const BUSINESS = {
  name: "A Mercury Crackers",
  owner: "S.K Agarwal",
  founded: "1994",
  phone: "9557149655",
  whatsapp: "9557149655",
  email: "Amercurycrackers@gmail.com",
  city: "Bareilly",
  region: "Uttar Pradesh",
  country: "IN",
};
