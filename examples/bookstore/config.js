// Set A: Online Bookstore Management System
const CATEGORIES = ['Fiction', 'Science', 'History', 'Biography', 'Technology', 'Children'];

const CONFIG = {
  title: 'BookNook',
  layout: 'top',
  theme: 'light',
  pages: ['home', 'books', 'categories', 'contact'],
  authPages: ['login', 'signup'],
  protected: [],
  requireLogin: true,                 // user login facility: everything needs login
  labels: { contact: 'Contact Us' },

  database: 'bookstore',              // shows up as "bookstore" in MongoDB Compass
  shared: ['books'],                  // every logged-in user sees all books

  // Form fields per MongoDB collection (used by crudForm on any page)
  forms: {
    books: [
      'Book Name',
      'Author Name',
      { label: 'Category', options: CATEGORIES },
      { label: 'Price', type: 'number', min: 0 },
    ],
  },
  contact: { address: '12 Book Street, Pune', phone: '+91 98765 43210', email: 'hello@booknook.example' },
};
