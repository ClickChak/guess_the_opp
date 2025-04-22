// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFtvUCuP3uh4FgxRFE7jbE0Ek4xCJ3cEc",
  authDomain: "guesstheopp-86dcb.firebaseapp.com",
  projectId: "guesstheopp-86dcb",
  storageBucket: "guesstheopp-86dcb.firebasestorage.app",
  messagingSenderId: "617740240709",
  appId: "1:617740240709:web:a2af9d88b66384523e202c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Handle login form submission
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent form from refreshing the page

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up successfully
      const user = userCredential.user;
      alert("SignedUp successfuly!");
      console.log("User:", user);

      // Redirect to the main page or dashboard
      window.location.href = "login.html";
    })
    .catch((error) => {
      // Handle errors
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`Error: ${errorMessage}`);
      console.error("Error Code:", errorCode, "Message:", errorMessage);
    });
});
