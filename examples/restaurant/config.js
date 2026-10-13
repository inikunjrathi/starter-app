// Restaurant Management: menu with cart and online ordering, table reservations
const MENU = [
  { id: 1, name: 'Paneer Tikka', price: 220, category: 'Starters', veg: true },
  { id: 2, name: 'Chicken 65', price: 260, category: 'Starters', veg: false },
  { id: 3, name: 'Veg Spring Roll', price: 180, category: 'Starters', veg: true },
  { id: 4, name: 'Butter Chicken', price: 340, category: 'Main Course', veg: false },
  { id: 5, name: 'Dal Makhani', price: 240, category: 'Main Course', veg: true },
  { id: 6, name: 'Veg Biryani', price: 260, category: 'Main Course', veg: true },
  { id: 7, name: 'Butter Naan', price: 50, category: 'Breads', veg: true },
  { id: 8, name: 'Garlic Naan', price: 60, category: 'Breads', veg: true },
  { id: 9, name: 'Gulab Jamun', price: 90, category: 'Desserts', veg: true },
  { id: 10, name: 'Mango Lassi', price: 110, category: 'Drinks', veg: true },
];

const CONFIG = {
  title: 'Spice Garden',
  layout: 'top',
  theme: 'light',
  pages: ['home', 'menu', 'orders', 'reservations', 'contact'],
  authPages: ['login', 'signup'],
  protected: ['orders'],
  requireLogin: false,                 // browse the menu without login; ordering needs login
  labels: { orders: 'My Orders', reservations: 'Book a Table', contact: 'Contact Us' },

  database: 'restaurant',
  shared: [],                          // customers only see their own orders and reservations

  forms: {
    reservations: [
      'Name',
      { label: 'Phone', type: 'tel', pattern: '[0-9]{10}', placeholder: '10 digits' },
      { label: 'Date', type: 'date' },
      { label: 'Time', type: 'time', min: '11:00', max: '23:00' },
      { label: 'Guests', type: 'number', min: 1, max: 20 },
      { label: 'Special Request', type: 'textarea', required: false },
    ],
  },
  contact: { address: 'Spice Garden, Koregaon Park, Pune', phone: '+91 98111 22333', email: 'eat@spicegarden.example' },
};
