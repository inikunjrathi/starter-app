// Set F: Online Food Ordering System
const CATEGORIES = ['Starters', 'Main Course', 'Desserts', 'Beverages'];

// Coupon codes shown on the Offers page and accepted at checkout
const OFFERS = [
  { code: 'FEAST20', percent: 20, min: 500, text: '20% off on orders above ₹500' },
  { code: 'WELCOME10', percent: 10, min: 0, text: '10% off on your order, no minimum' },
  { code: 'SWEET15', percent: 15, min: 300, text: '15% off on orders above ₹300' },
];

const CONFIG = {
  title: 'FoodieHub',
  layout: 'top',
  theme: 'light',
  // "Menu" is a dropdown: All Items + one entry per category (menu.html reads ?cat=...)
  pages: ['home', { Menu: ['menu', ...CATEGORIES.map(c => `menu?cat=${c}`)] }, 'orders', 'offers', 'contact'],
  authPages: ['login', 'signup'],
  protected: [],
  requireLogin: true,
  labels: { menu: 'All Items', orders: 'My Orders', contact: 'Contact Us' },

  database: 'foodorder',
  shared: ['fooditems'],               // everyone sees the menu; orders stay private

  forms: {
    fooditems: [
      'Food Item Name',
      { label: 'Category', options: CATEGORIES },
      { label: 'Type', options: ['Veg', 'Non-Veg'] },
      { label: 'Price', type: 'number', min: 1 },
      { label: 'Availability', options: ['Available', 'Not Available'] },
      { label: 'Popular', options: ['No', 'Yes'] },
    ],
  },
  contact: { address: 'FoodieHub Kitchen, Viman Nagar, Pune', phone: '+91 90000 12345', email: 'orders@foodiehub.example' },
};
