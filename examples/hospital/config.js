// Hospital Management System: register patients, view patients and doctors
const DOCTORS = [
  { name: 'Dr. Asha Rao', dept: 'Cardiology', time: 'Mon-Fri, 10 AM - 2 PM', icon: 'heart-pulse' },
  { name: 'Dr. Vikram Shah', dept: 'Orthopedics', time: 'Mon-Sat, 4 PM - 8 PM', icon: 'person-wheelchair' },
  { name: 'Dr. Neha Kulkarni', dept: 'Pediatrics', time: 'Tue-Sun, 9 AM - 1 PM', icon: 'balloon-heart' },
  { name: 'Dr. Arjun Mehta', dept: 'Neurology', time: 'Mon-Thu, 11 AM - 3 PM', icon: 'activity' },
  { name: 'Dr. Priya Nair', dept: 'Dermatology', time: 'Wed-Sat, 2 PM - 6 PM', icon: 'bandaid' },
  { name: 'Dr. Rahul Joshi', dept: 'General Medicine', time: 'Daily, 8 AM - 8 PM', icon: 'clipboard2-pulse' },
];

const CONFIG = {
  title: 'CarePlus Hospital',
  layout: 'top',
  theme: 'light',
  pages: ['home', 'patients', 'doctors', 'contact'],
  authPages: ['login', 'signup'],
  protected: [],
  requireLogin: true,
  labels: { contact: 'Contact Us' },

  database: 'hospital',
  shared: ['patients'],

  forms: {
    patients: [
      'Patient Name',
      { label: 'Age', type: 'number', min: 0, max: 120 },
      { label: 'Gender', options: ['Male', 'Female', 'Other'] },
      { label: 'Blood Group', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      'Disease',
      { label: 'Doctor', options: DOCTORS.map(d => `${d.name} (${d.dept})`) },
      { label: 'Admission Date', type: 'date' },
      { label: 'Phone', type: 'tel', pattern: '[0-9]{10}', placeholder: '10 digits' },
    ],
  },
  contact: { address: 'CarePlus Hospital, FC Road, Pune', phone: '+91 20 1234 5678', email: 'help@careplus.example' },
};
