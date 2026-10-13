// Library Management System: book catalog, issue books, track returns
const BOOKS = [
  { title: 'Clean Code', author: 'Robert C. Martin', copies: 4 },
  { title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', copies: 3 },
  { title: 'Introduction to Algorithms', author: 'Cormen et al.', copies: 5 },
  { title: 'Database System Concepts', author: 'Silberschatz', copies: 2 },
  { title: 'Operating System Concepts', author: 'Silberschatz', copies: 3 },
  { title: 'Computer Networks', author: 'Tanenbaum', copies: 4 },
];

const CONFIG = {
  title: 'City Library',
  layout: 'top',
  theme: 'light',
  pages: ['home', 'catalog', 'issue', 'contact'],
  authPages: ['login', 'signup'],
  protected: [],
  requireLogin: true,
  labels: { catalog: 'Book Catalog', issue: 'Issue Book', contact: 'Contact Us' },

  database: 'library',
  shared: ['issues'],

  forms: {
    issues: [
      'Student Name',
      { label: 'Roll No', pattern: '[A-Za-z0-9]+' },
      { label: 'Book Title', options: BOOKS.map(b => b.title) },
      { label: 'Issue Date', type: 'date' },
      { label: 'Return Date', type: 'date' },
      { label: 'Status', options: ['Issued', 'Returned'] },
    ],
  },
  contact: { address: 'City Library, JM Road, Pune', phone: '+91 20 2222 3333', email: 'library@city.example' },
};
