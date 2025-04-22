// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLCUg15WyLg4bqZUfgkwOnJwP8ufB7hRI",
  authDomain: "guesstheopp.firebaseapp.com",
  projectId: "guesstheopp",
  storageBucket: "guesstheopp.firebasestorage.app",
  messagingSenderId: "40302006389",
  appId: "1:40302006389:web:c3df0449d7afa3a9b6a83c",
  measurementId: "G-3DLMB327YK"
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