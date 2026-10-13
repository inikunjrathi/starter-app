// Student Registration / College Admission System
const COURSES = [
  { name: 'B.Tech Computer Engineering', years: 4, seats: 120, icon: 'cpu' },
  { name: 'B.Tech Information Technology', years: 4, seats: 60, icon: 'globe' },
  { name: 'B.Tech Electronics', years: 4, seats: 60, icon: 'motherboard' },
  { name: 'BBA', years: 3, seats: 90, icon: 'briefcase' },
  { name: 'B.Sc Data Science', years: 3, seats: 60, icon: 'bar-chart' },
  { name: 'MBA', years: 2, seats: 120, icon: 'graph-up-arrow' },
];

const CONFIG = {
  title: 'Sunrise College',
  layout: 'top',
  theme: 'light',
  pages: ['home', 'courses', 'admission', 'students', 'contact'],
  authPages: ['login', 'signup'],
  protected: ['students'],               // anyone can apply; only logged-in users see the list
  requireLogin: false,
  labels: { contact: 'Contact Us' },

  database: 'college',
  shared: ['students'],

  forms: {
    students: [
      'Full Name',
      { label: 'Email', type: 'email' },
      { label: 'Phone', type: 'tel', pattern: '[0-9]{10}', placeholder: '10 digits' },
      { label: 'Date of Birth', name: 'dob', type: 'date' },
      { label: 'Gender', options: ['Male', 'Female', 'Other'] },
      { label: 'Course', options: COURSES.map(c => c.name) },
      { label: '12th Percentage', name: 'percentage', type: 'number', min: 0, max: 100 },
      { label: 'Address', type: 'textarea' },
    ],
  },
  contact: { address: 'Sunrise College, Hinjewadi, Pune', phone: '+91 20 4444 5555', email: 'admissions@sunrise.example' },
};
