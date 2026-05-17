export type PolicyKey = "shipping" | "return" | "privacy" | "terms" | "safety";

export interface Policy {
  key: PolicyKey;
  title: string;
  content: string;
}

export const POLICY_ORDER: PolicyKey[] = [
  "shipping",
  "return",
  "privacy",
  "terms",
  "safety",
];

export const POLICY_LABELS: Record<PolicyKey, string> = {
  shipping: "Shipping Policy",
  return: "Return Policy",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
  safety: "Safety Guidelines",
};

export const DEFAULT_POLICIES: Record<PolicyKey, Policy> = {
  shipping: {
    key: "shipping",
    title: "Shipping Policy",
    content: `We deliver across India. Orders within Bareilly are usually dispatched the same day and reach you within 24–48 hours.

For outstation orders, dispatch happens within 1–2 working days. Delivery time depends on your location and the courier partner — typically 4–7 working days.

• Free delivery on orders above ₹3000 (within Bareilly).
• For outstation orders, shipping charges are calculated at checkout based on weight and pin-code.
• During Diwali season (October–November), expect a 2–3 day delay due to high volume and courier restrictions on fireworks.
• Fireworks can only be shipped by surface (road) transport per Explosives Rules, 2008. Air shipment is strictly not permitted.
• We share a tracking number on WhatsApp once your order is dispatched.

For any shipping query, WhatsApp us at +91 9557149655.`,
  },
  return: {
    key: "return",
    title: "Return Policy",
    content: `Due to the hazardous nature of fireworks, we do not accept returns once a package has been delivered and signed for.

However, we stand behind the quality of every product we sell. If your order arrives damaged, broken, or with missing items, please raise a claim within 24 hours of delivery.

To raise a claim:
1. Take a clear photo of the damaged box and the affected items immediately after opening.
2. WhatsApp the photos along with your order number to +91 9557149655.
3. Our team will verify and arrange a replacement or refund within 3–5 working days.

Refunds are processed to the original payment method. Cash-on-delivery refunds are sent via UPI.

We do not entertain claims raised after 24 hours of delivery, or for products that have been used, lit, or stored improperly.`,
  },
  privacy: {
    key: "privacy",
    title: "Privacy Policy",
    content: `A Mercury Crackers respects your privacy. This policy explains what we collect, why, and how we protect it.

What we collect
• Name, phone number, email, and delivery address — only what is needed to fulfil your order.
• Order history, so we can serve you better next season.
• Anonymous usage data (page views, device type) to improve the website.

How we use it
• To process and deliver your orders.
• To send order updates over WhatsApp or SMS.
• To occasionally share offers and new arrivals — you can opt out anytime by replying STOP.

What we do NOT do
• We never sell or rent your personal data to third parties.
• We do not store your card or UPI credentials. Payments are handled by trusted gateways.

Data security
Your information is stored on secure servers with restricted access. Order data is retained for up to 3 years for GST and accounting compliance.

Your rights
You can request a copy of your data, or ask us to delete it, by writing to Amercurycrackers@gmail.com. We will respond within 7 working days.`,
  },
  terms: {
    key: "terms",
    title: "Terms & Conditions",
    content: `By placing an order with A Mercury Crackers, you agree to the following terms.

Eligibility
• You must be 18 years or older to purchase fireworks.
• You confirm that the use of fireworks is permitted by local authorities in your area.

Orders & Pricing
• Prices listed include applicable GST.
• We reserve the right to refuse or cancel any order at our discretion (for example, stock unavailability, suspected fraud, or restricted delivery zones).
• In case of cancellation by us, a full refund is processed within 5 working days.

Payment
• We accept UPI, bank transfer, and cash on delivery (Bareilly only).
• Orders are confirmed only after payment is received or COD is verified.

Liability
• A Mercury Crackers is not liable for any injury, damage, or loss caused by improper use or storage of fireworks.
• Always follow the safety guidelines printed on the packaging and the Safety Guidelines on this website.

Governing Law
All disputes are subject to the jurisdiction of courts in Bareilly, Uttar Pradesh.

Compliance
Sale regulated under the Explosives Act 1884 and the Explosives Rules 2008. HSN 3604. Strictly 18+.`,
  },
  safety: {
    key: "safety",
    title: "Safety Guidelines",
    content: `Fireworks are fun — but only when handled safely. Please read and share these guidelines with everyone in your celebration.

Before you light
• Buy only from licensed sellers. Cheap, unbranded crackers cause most accidents.
• Store crackers in a cool, dry place away from heat, sunlight, candles, and diyas.
• Keep matches, lighters, and crackers out of children's reach.
• Read the instructions printed on each packet before lighting.
• Wear cotton clothes — synthetic fabrics catch fire easily and stick to skin.
• Tie long hair back. Avoid loose dupattas or scarves.

Where to light
• Always light fireworks in an open outdoor space, away from buildings, vehicles, dry leaves, and crowds.
• Maintain a safe distance from windows, balconies, and parked two-wheelers.
• Keep a bucket of water and a bucket of sand handy at all times.
• Never light crackers on a terrace, balcony, or any enclosed area.

While lighting
• Light one cracker at a time, using an agarbatti or a long candle — never a matchstick held close.
• Step back at least 3–4 metres immediately after lighting.
• Adults must supervise children at all times. Children under 10 should only handle sparklers (phuljhari), and never alone.
• Never lean over a cracker while lighting it.
• Never try to re-light a "dud" cracker that did not go off. Wait 15 minutes, then soak it in water and dispose of it.
• Never hold a cracker in your hand while lighting it (except sparklers).
• Never pick up or examine a cracker that has been lit.

In case of an injury
• For minor burns: hold the area under cool running water for at least 10 minutes. Do NOT apply ice, toothpaste, butter, or any home remedy.
• For eye injuries: do not rub the eye. Cover it loosely with a clean cloth and go to a hospital immediately.
• For serious burns or breathing difficulty: call 112 or rush to the nearest emergency room.
• Keep your doctor's number and the nearest hospital's address handy.

What NOT to do
✗ Do not make your own crackers or alter store-bought ones.
✗ Do not put crackers inside bottles, cans, or tins.
✗ Do not throw lit crackers at people, animals, or vehicles.
✗ Do not light crackers near LPG cylinders, vehicles, or any flammable material.
✗ Do not burst crackers in silence zones (near hospitals, schools, places of worship) or after 10 PM, as per Supreme Court guidelines.

Respect your neighbours, your pets, and the environment. Have a safe and joyful celebration!`,
  },
};

export const POLICIES_STORAGE_KEY = "policies";
