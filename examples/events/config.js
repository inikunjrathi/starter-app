// Event Registration System: list events, register participants, view participants per event
const EVENTS = [
  { name: 'Hackathon', date: '2026-11-20', venue: 'Main Auditorium', fee: 200, icon: 'code-slash' },
  { name: 'Robo Race', date: '2026-11-21', venue: 'Sports Ground', fee: 150, icon: 'robot' },
  { name: 'Web Design Contest', date: '2026-11-21', venue: 'Lab 3', fee: 100, icon: 'palette' },
  { name: 'Quiz Bowl', date: '2026-11-22', venue: 'Seminar Hall', fee: 50, icon: 'patch-question' },
  { name: 'Paper Presentation', date: '2026-11-22', venue: 'Conference Room', fee: 100, icon: 'file-earmark-text' },
  { name: 'Gaming Arena', date: '2026-11-22', venue: 'Lab 5', fee: 100, icon: 'controller' },
];

const CONFIG = {
  title: 'TechFest 2026',
  layout: 'top',
  theme: 'dark',
  pages: ['home', 'events', 'register', 'participants', 'contact'],
  authPages: ['login', 'signup'],
  protected: [],
  requireLogin: true,
  labels: { contact: 'Contact Us' },

  database: 'techfest',
  shared: ['registrations'],

  forms: {
    registrations: [
      'Full Name',
      { label: 'Email', type: 'email' },
      { label: 'Phone', type: 'tel', pattern: '[0-9]{10}', placeholder: '10 digits' },
      'College',
      { label: 'Year', options: ['FE', 'SE', 'TE', 'BE'] },
      { label: 'Event', options: EVENTS.map(e => e.name) },
    ],
  },
  contact: { address: 'Sunrise College Campus, Pune', phone: '+91 99999 00000', email: 'techfest@sunrise.example' },
};
