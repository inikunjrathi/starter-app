// ===== MAIN FILE: edit this to change the website =====
// Every name below is a file in public/pages/<name>.html.
// Add / remove / reorder names to add / remove / reorder features.
// Group pages into a dropdown with { 'Group name': ['page1', 'page2'] }.
// New feature: copy any file in pages/, rename it, add the name here.
//
// Available pages: home, dashboard, gallery, slider, components, form, upload, table,
//   cart, calculator, bmi, converter, password, stopwatch, todo, expenses,
//   quiz, tictactoe, guess, notes, messages, profile
const CONFIG = {
  title: 'My Website',
  layout: 'both',      // 'top' = topbar only, 'side' = sidebar only, 'both'
  theme: 'light',      // 'light' or 'dark' (starting theme)
  themeToggle: true,   // show light/dark switch in the topbar
  pages: [
    'home',
    'dashboard',
    'gallery',
    'cart',
    { 'UI': ['slider', 'components', 'form', 'upload', 'table'] },
    { 'Tools': ['calculator', 'bmi', 'converter', 'password', 'stopwatch', 'todo', 'expenses'] },
    { 'Games': ['quiz', 'tictactoe', 'guess'] },
    { 'Account': ['profile', 'notes', 'messages'] },
  ],
  // Pages shown at the right of the topbar (not in the main menu)
  authPages: ['login', 'signup'],
  // Pages only visible after login (must also be listed above)
  protected: ['profile', 'notes', 'messages'],
};
