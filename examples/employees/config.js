// Employee Management System: add, view, edit, delete employees; department summary
const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Support'];

const CONFIG = {
  title: 'Acme HR',
  layout: 'both',
  theme: 'light',
  pages: ['home', 'employees', 'departments', 'contact'],
  authPages: ['login', 'signup'],
  protected: [],
  requireLogin: true,
  labels: { contact: 'Contact Us' },

  database: 'company',
  shared: ['employees'],

  forms: {
    employees: [
      'Employee Name',
      { label: 'Email', type: 'email' },
      { label: 'Department', options: DEPARTMENTS },
      'Designation',
      { label: 'Salary', type: 'number', min: 0 },
      { label: 'Joining Date', type: 'date' },
    ],
  },
  contact: { address: 'Acme Corp, Baner, Pune', phone: '+91 20 7777 8888', email: 'hr@acme.example' },
};
