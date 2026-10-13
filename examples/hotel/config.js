// Hotel Booking System: rooms, booking form, my bookings
const ROOMS = [
  { type: 'Standard', price: 2500, guests: 2, icon: 'door-closed', text: 'Queen bed, city view, free Wi-Fi' },
  { type: 'Deluxe', price: 4000, guests: 3, icon: 'door-open', text: 'King bed, balcony, breakfast included' },
  { type: 'Suite', price: 7500, guests: 4, icon: 'stars', text: 'Living room, bathtub, lounge access' },
  { type: 'Family Room', price: 6000, guests: 6, icon: 'people', text: 'Two king beds, kids play area' },
];

const CONFIG = {
  title: 'The Grand Stay',
  layout: 'top',
  theme: 'light',
  pages: ['home', 'rooms', 'booking', 'contact'],
  authPages: ['login', 'signup'],
  protected: ['booking'],
  requireLogin: false,
  labels: { booking: 'Book a Room', contact: 'Contact Us' },

  database: 'hotel',
  shared: [],

  forms: {
    bookings: [
      'Guest Name',
      { label: 'Email', type: 'email' },
      { label: 'Phone', type: 'tel', pattern: '[0-9]{10}', placeholder: '10 digits' },
      { label: 'Room Type', options: ROOMS.map(r => r.type) },
      { label: 'Check-in', name: 'checkIn', type: 'date' },
      { label: 'Check-out', name: 'checkOut', type: 'date' },
      { label: 'Guests', type: 'number', min: 1, max: 6 },
    ],
  },
  contact: { address: 'The Grand Stay, MG Road, Pune', phone: '+91 20 9999 1111', email: 'stay@grand.example' },
};
