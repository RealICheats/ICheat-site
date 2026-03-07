// Basic form handling (prevent default + show alert for demo)
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (username && password) {
    alert(`Welcome back, ${username}! (Demo login)`);
    // In a real app: send data to backend / Netlify Function here
    // Example: fetch('/.netlify/functions/login', { method: 'POST', body: JSON.stringify({ username, password }) })
  } else {
    alert('Please fill in both fields');
  }
});
