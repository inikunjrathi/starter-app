// Set A: Online Bookstore Management System
const CONFIG = {
  title: 'BookNook',
  layout: 'top',
  theme: 'light',
  themeToggle: false,
  pages: ['home', 'books', 'categories', 'contact'],
  authPages: ['login', 'signup'],
  protected: [],
  requireLogin: true,                 // user login facility: everything needs login
  labels: { contact: 'Contact Us' },

  database: 'bookstore',              // shows up as "bookstore" in MongoDB Compass
  shared: ['books'],                  // every logged-in user sees all books

  // Your own data can live here too; pages read it as CONFIG.categories
  categories: ['Fiction', 'Science', 'History', 'Biography', 'Technology', 'Children'],
};
