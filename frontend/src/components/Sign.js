// const container = document.getElementById("container");
// const registerBtn = document.getElementById("register");
// const loginBtn = document.getElementById("login");

// // Add event listeners to toggle between login and register
// registerBtn.addEventListener("click", () => {
//   container.classList.add("active");
// });

// loginBtn.addEventListener("click", () => {
//   container.classList.remove("active");
// });

// // Handle form submission for login and register
// document.getElementById("login-form").addEventListener("submit", function(event) {
//     event.preventDefault(); // Prevent default form submission
//     window.location.href = "x.html"; // Redirect to another page after login
// });

// document.getElementById("register-form").addEventListener("submit", function(event) {
//     event.preventDefault(); // Prevent default form submission
//     window.location.href = "x.html"; // Redirect after successful registration
// });





const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

// Toggle between login and register forms
registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

// Handle form submission for login
document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    let email = document.getElementById("login-email").value;
    let password = document.getElementById("login-password").value;

    if (email && password) {
        alert("Login successful!");
        window.location.href = "x.html"; // Redirect to the next page
    } else {
        alert("Please fill in all fields!");
    }
});

// Handle form submission for registration
document.getElementById("register-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    let name = document.getElementById("register-name").value;
    let email = document.getElementById("register-email").value;
    let password = document.getElementById("register-password").value;

    if (name && email && password) {
        alert("Registration successful!");
        window.location.href = "x.html"; // Redirect after registration
    } else {
        alert("Please fill in all fields!");
    }
});
