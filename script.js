document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (username && password) {
    alert(`Welcome back, ${username}!`);
    // In a real app: send data to a backend / Netlify Function here
  } else {
    alert('Please fill in both fields');
  }
});
