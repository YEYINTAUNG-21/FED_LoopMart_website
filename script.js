// For Sign Up Pages
const API_KEY = "677f3656c7a8646786c7832f"; 
const NORMAL_SIGNUP_URL = "https://account-25ce.restdb.io/rest/normal-sign-up-page";
const BUSINESS_SIGNUP_URL = "https://account-25ce.restdb.io/rest/business-sign-up-page";


async function checkIfUserExists(url, email) {
    try {
        const response = await fetch(`${url}?q={"email":"${email}"}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": API_KEY,
            },
        });

        const users = await response.json();
        return users.length > 0; 
    } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
    }
}

async function submitToRestDB(url, formData) {
    try {
        const data = Object.fromEntries(formData.entries());
        const userExists = await checkIfUserExists(url, data.email);

        if (userExists) {
            alert("User already exists. Please log in or use a different email.");
            return false; 
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": API_KEY,
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            console.log("User added successfully.");
            return true;
        } else {
            console.error("Error response from server:", await response.json());
            return false;
        }
    } catch (error) {
        console.error("Submission error:", error);
        return false;
    }
}

const normalForm = document.getElementById("normal-signup-form");
if (normalForm) {
    normalForm.addEventListener("submit", async (event) => {
        event.preventDefault(); 
        const success = await submitToRestDB(NORMAL_SIGNUP_URL, new FormData(normalForm));
        if (success) {
            normalForm.reset(); 
            window.location.href = "Login.html"; 
        }
    });
}

const businessForm = document.getElementById("business-signup-form");
if (businessForm) {
    businessForm.addEventListener("submit", async (event) => {
        event.preventDefault(); 

        const formData = new FormData(businessForm);
        console.log("Submitting business sign-up form:", Object.fromEntries(formData.entries()));

        const success = await submitToRestDB(BUSINESS_SIGNUP_URL, formData);

        if (success) {
            console.log("Business account successfully created. Redirecting to Login.html...");
            window.location.href = "Login.html";
        } else {
            console.error("Failed to create a business account.");
            alert("Failed to sign up. Please try again.");
        }
    });
}

// Login Page
async function validateLogin(usernameOrEmail, password) {
    try {
        const [normalResponse, businessResponse] = await Promise.all([
            fetch(NORMAL_SIGNUP_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": API_KEY,
                },
            }),
            fetch(BUSINESS_SIGNUP_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": API_KEY,
                },
            }),
        ]);

        const normalUsers = await normalResponse.json();
        const businessUsers = await businessResponse.json();

        console.log("Normal Users:", normalUsers);
        console.log("Business Users:", businessUsers);

        const allUsers = [
            ...normalUsers.map((user) => ({
                email: user["E-mail"], 
                password: user.Password, 
                type: "normal", 
            })),
            ...businessUsers.map((user) => ({
                email: user["E-mail"], 
                password: user.Password, 
                type: "business", 
            })),
        ];

        console.log("Combined All Users:", allUsers);

        const user = allUsers.find(
            (u) =>
                u.email.toLowerCase() === usernameOrEmail.toLowerCase() && 
                u.password === password
        );

        console.log("User Found:", user);

        return user || null;
    } catch (error) {
        console.error("Error validating login:", error);
        return null;
    }
}

const loginForm = document.querySelector(".login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const usernameOrEmail = formData.get("email") || formData.get("username");
        const password = formData.get("password");

        console.log("Entered Credentials:", { usernameOrEmail, password });

        const user = await validateLogin(usernameOrEmail, password);

        if (user) {
            console.log("Login successful:", user);
            sessionStorage.setItem("loggedInUser", JSON.stringify(user));
            window.location.href = "MainPage.html";
        } else {
            alert("Invalid username/email or password. Please try again.");
        }
    });
} else {
    console.error("Login form not found.");
}


/* For Main Page */

document.addEventListener('DOMContentLoaded', () => {
    const leftArrows = document.querySelectorAll('.left-arrow');
    const rightArrows = document.querySelectorAll('.right-arrow');
    const listingContainers = document.querySelectorAll('.listing-container');

 
    listingContainers.forEach((container, index) => {
        const leftArrow = leftArrows[index];
        const rightArrow = rightArrows[index];

        leftArrow.addEventListener('click', () => {
            container.scrollBy({
                left: -300, 
                behavior: 'smooth',
            });
        });

        rightArrow.addEventListener('click', () => {
            container.scrollBy({
                left: 300, 
                behavior: 'smooth',
            });
        });
    });
});


/* Random profile for main page */

document.addEventListener("DOMContentLoaded", () => {
    // Function to generate a DiceBear avatar URL with a unique seed
    function generateDiceBearAvatar(seed) {
        return `https://api.dicebear.com/6.x/adventurer/svg?seed=${seed}`;
    }

    function generateRandomName() {
        const firstNames = ["Alex", "Jamie", "Taylor", "Jordan", "Morgan", "Casey", "Riley", "Cameron", "Drew", "Quinn"];
        const lastNames = ["Smith", "Johnson", "Lee", "Brown", "Taylor", "Miller", "Anderson", "Thomas", "Jackson", "White"];

        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

        return `${firstName} ${lastName}`;
    }

    const profileImageElements = document.querySelectorAll(".profile-img");
    const profileNameElements = document.querySelectorAll(".profile-name");

    profileImageElements.forEach((img, index) => {
        const uniqueSeed = `user-${index}-${Math.random().toString(36).substring(2, 15)}`;
        img.src = generateDiceBearAvatar(uniqueSeed);
    });

    profileNameElements.forEach((nameElement) => {
        nameElement.textContent = generateRandomName();
    });
});

/* For User Profile */
document.addEventListener("DOMContentLoaded", () => {
    const profileImg = document.getElementById("profileImg");
    function generateDiceBearAvatar(seed) {
        return `https://api.dicebear.com/6.x/adventurer/svg?seed=${seed}`;
    }
    let profileSeed = localStorage.getItem("profileSeed");

    if (!profileSeed) {
        
        profileSeed = `user-${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem("profileSeed", profileSeed); 
    }

    profileImg.src = generateDiceBearAvatar(profileSeed);
});

// Country Dropdown
document.getElementById('country-dropdown-btn').addEventListener('click', function() {
    const dropdownOptions = document.getElementById('country-dropdown-options');
    dropdownOptions.style.display = dropdownOptions.style.display === 'block' ? 'none' : 'block';
});

const countryOptions = document.querySelectorAll('#country-dropdown-options .option');
countryOptions.forEach(function(option) {
    option.addEventListener('click', function() {
        const selectedCountry = option.textContent;
        document.getElementById('country-input').value = selectedCountry; 
        document.getElementById('country-dropdown-options').style.display = 'none'; 
    });
});

// Gender dropdown
document.getElementById('gender-dropdown-btn').addEventListener('click', function() {
    const dropdownOptions = document.getElementById('gender-dropdown-options');
    // Toggle visibility of the dropdown options
    dropdownOptions.style.display = dropdownOptions.style.display === 'block' ? 'none' : 'block';
});

const options = document.querySelectorAll('.dropdown-options .option');
options.forEach(function(option) {
    option.addEventListener('click', function() {
        const selectedGender = option.textContent;
        document.getElementById('gender-input').value = selectedGender; 
        document.getElementById('gender-dropdown-options').style.display = 'none'; 
    });
});

// Close dropdown if clicked outside
window.addEventListener('click', function(event) {
    const dropdownOptions = document.getElementById('gender-dropdown-options');
    const dropdownButton = document.getElementById('gender-dropdown-btn');
    if (!dropdownButton.contains(event.target) && !dropdownOptions.contains(event.target)) {
        dropdownOptions.style.display = 'none';
    }
});