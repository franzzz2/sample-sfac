function redirectToHome(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('http://localhost:3000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        // Store login status in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        window.location.href = "index.html";
      } else if (data.status === 'already_logged_in') {
        alert('You are already logged in. Redirecting...');
        window.location.href = "index.html";
      } else {
        alert("Error saving login data");
      }
    })
    .catch(error => console.error('Error:', error));
}

// Check on page load if the user is already logged in
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('isLoggedIn') === 'true') {
    window.location.href = "index.html";
  }
});
