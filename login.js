// Show login form
function showLogin() {
    document.getElementById('loginContainer').classList.add('active');
    document.getElementById('signUpContainer').classList.remove('active');
    document.getElementById('forgotPasswordContainer').classList.remove('active');
    document.querySelector('.tab.active').classList.remove('active');
    document.querySelector('.sidebar .tab:first-child').classList.add('active');
}

// Show sign-up form
function showSignUp() {
    document.getElementById('loginContainer').classList.remove('active');
    document.getElementById('signUpContainer').classList.add('active');
    document.getElementById('forgotPasswordContainer').classList.remove('active');
    document.querySelector('.tab.active').classList.remove('active');
    document.querySelector('.sidebar .tab:last-child').classList.add('active');
}

// Show forgot password form
function showForgotPassword() {
    document.getElementById('loginContainer').classList.remove('active');
    document.getElementById('signUpContainer').classList.remove('active');
    document.getElementById('forgotPasswordContainer').classList.add('active');
}

// Initialize with login form visible
showLogin();

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.message === 'Login successful!') {
            window.location.href = 'nlp.html'; // Redirect to the chatbot page
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Handle sign-up form submission
document.getElementById('signUpForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;

    fetch('http://127.0.0.1:5000/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.message === 'Signup successful!') {
            showLogin(); // Switch to login view after successful signup
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Handle forgot password form submission
document.getElementById('forgotPasswordForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('forgotEmail').value;

    fetch('http://127.0.0.1:5000/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
