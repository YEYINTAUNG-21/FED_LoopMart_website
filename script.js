// API Key and Collection URLs
const API_KEY = "677f3656c7a8646786c7832f"; 
const NORMAL_SIGNUP_URL = "https://account-25ce.restdb.io/rest/normal-sign-up-page";
const BUSINESS_SIGNUP_URL = "https://account-25ce.restdb.io/rest/business-sign-up-page";
const LISTINGS_URL = "https://account-25ce.restdb.io/rest/add-listing-page";

// function to check if a user already exists
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
        return users.length > 0; // Returns true if the user exists
    } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
    }
}

// function to submit form data to RestDB
async function submitToRestDB(url, formData) {
    try {
        const data = Object.fromEntries(formData.entries());
        const userExists = await checkIfUserExists(url, data.email);

        if (userExists) {
            alert("User already exists. Please log in or use a different email.");
            return false; 
        }

        // Submit the data if the user doesn't exist
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

// Attach event listener for Normal Sign-Up Page
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

// Attach event listener for Business Sign-Up Page
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

// Function to validate login credentials
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
                name: user.Name,                    
                type: "normal",
            })),
            ...businessUsers.map((user) => ({
                email: user["E-mail"],
                password: user.Password,
                businessName: user["Business-Name"], 
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


// Attach login event listener
const loginForm = document.querySelector(".login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); 

        const formData = new FormData(loginForm);
        const usernameOrEmail = formData.get("email"); 
        const password = formData.get("password");     

        const user = await validateLogin(usernameOrEmail, password);

        if (user) {
            sessionStorage.setItem("loggedInUser", JSON.stringify({
                email: user.email,
                name: user.name || user["Business-Name"] || user["Name"] || user.email.split('@')[0]  // Fallbacks
            }));

            window.location.href = "MainPage.html";
        } else {
            alert("Invalid username/email or password. Please try again.");
        }
    });
}

// To show account name
document.addEventListener("DOMContentLoaded", () => {
    const accountNameElement = document.getElementById("accountName");
    const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

    if (loggedInUser) {
        accountNameElement.textContent = loggedInUser.name || loggedInUser.email.split('@')[0];
    } else {
        accountNameElement.textContent = "Default Name"; 
    }
});

// add Listings page
document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript Loaded!");

    const fileInput = document.getElementById("imageUpload");
    const previewImage = document.getElementById("previewImage");
    const defaultText = document.getElementById("defaultText");
    const uploadButton = document.getElementById("uploadButton");
    const form = document.getElementById("add-listing-form");
    const priceInput = document.getElementById("itemPrice");

    if (!fileInput || !previewImage || !defaultText || !uploadButton || !form || !priceInput) {
        return;
    }

    uploadButton.addEventListener("click", function (event) {
        event.preventDefault();
        fileInput.click();
    });

    fileInput.addEventListener("change", function (event) {
        const file = event.target.files[0];

        if (file) {

            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image file.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                previewImage.src = e.target.result;
                previewImage.style.display = "block";
                defaultText.style.display = "none";
            };
            reader.readAsDataURL(file);
        } else {
            previewImage.style.display = "none";
            defaultText.style.display = "block";
        }
    });

    // Price Input Formatting
    priceInput.addEventListener("input", function () {
        let value = priceInput.value.replace(/[^0-9.]/g, "");
        let parts = value.split(".");
        if (parts.length > 2) {
            value = parts[0] + "." + parts.slice(1).join("");
        }
        if (value.includes(".")) {
            let [integerPart, decimalPart] = value.split(".");
            decimalPart = decimalPart.substring(0, 2);
            value = integerPart + (decimalPart ? "." + decimalPart : "");
        }
        priceInput.value = value ? `$${value}` : "";
    });

    priceInput.addEventListener("blur", function () {
        if (priceInput.value === "" || priceInput.value === "$") {
            priceInput.value = "$0.00";
        }
    });

    // Image Resizing Function
    function resizeImage(file, callback) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                const maxWidth = 800;
                const maxHeight = 800;
                let width = img.width;
                let height = img.height;

                if (width > height && width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                } else if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                console.log("Image resized successfully!");
                callback(canvas.toDataURL("image/jpeg", 0.8)); 
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Handle Form Submission
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        console.log("Form submitted!");

        const file = fileInput.files[0];

        if (!file) {
            alert("Please upload an image.");
            return;
        }

        console.log("Selected file:", file);

        // Resize image before sending
        resizeImage(file, async function (resizedImageData) {
            const itemName = document.getElementById("itemName").value.trim();
            const briefDescription = document.getElementById("briefDescription").value.trim();
            const itemCondition = document.getElementById("itemCondition").value;
            const itemCategory = document.getElementById("itemCategory").value;
            const deliveryDeal = document.getElementById("deliveryDeal").value.trim();
            const priceValue = parseFloat(priceInput.value.replace(/[^0-9.]/g, ""));

            let loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
            let userName = loggedInUser ? loggedInUser.name : "Unknown User";

            if (!itemName || !briefDescription || !itemCondition || !itemCategory || !deliveryDeal || isNaN(priceValue)) {
                alert("Please fill out all required fields.");
                return;
            }

            // Construct Listing Data
            const listingData = {
                "User-Name": userName,
                "Listing-Image": resizedImageData,
                "Item-Name": itemName,
                "Short-Description-Item": briefDescription,
                "Item-Condition": itemCondition,
                "Item-Category": itemCategory,
                "Delivery-Deal": deliveryDeal,
                "Item-Price": priceValue
            };

            console.log("Submitting listing data:", listingData);

            try {
                const response = await fetch(LISTINGS_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-apikey": API_KEY,
                    },
                    body: JSON.stringify(listingData),
                });

                if (response.ok) {
                    alert("Listing added successfully!");
                    window.location.href = "ProfilePageListings.html";
                } else {
                    const errorData = await response.json();
                    console.error("Error response:", errorData);
                    alert("Error adding listing. Please try again.");
                }
            } catch (error) {
                console.error("Fetch Error:", error);
                alert("Failed to add listing. Please check your internet connection.");
            }
        });
    });
});

// Global function to trigger file upload (for inline onclick)
function triggerFileUpload() {
    const fileInput = document.getElementById("imageUpload");
    if (fileInput) {
        console.log("Global trigger: clicking file input");
        fileInput.click();
    } else {
        console.error("Element with ID 'imageUpload' not found!");
    }
}
window.triggerFileUpload = triggerFileUpload;




/* For Profile Page Listing */
document.addEventListener("DOMContentLoaded", async function () {
    if (!document.getElementById("listings-container")) return;

    console.log("JavaScript Loaded!");

    const listingsContainer = document.getElementById("listings-container");
    if (!listingsContainer) {
        console.error("Listings container not found! Check HTML.");
        return;
    }

    try {
        const response = await fetch(LISTINGS_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": API_KEY, 
            }
        });

        if (!response.ok) {
            console.error("Failed to fetch listings:", response.statusText);
            return;
        }

        const listings = await response.json();
        console.log("Listings fetched:", listings);

        if (listings.length === 0) {
            listingsContainer.innerHTML = "<p>No listings found.</p>";
            return;
        }

        listingsContainer.innerHTML = "";
        listings.forEach(listing => {
            const listingElement = document.createElement("div");
            listingElement.classList.add("listing-item");
            listingElement.innerHTML = `
                <div class="listing-card">
                    <img src="${listing['Listing-Image']}" alt="${listing['Item-Name']}" class="listing-image">
                    <div class="listing-info">
                        <h3>${listing['Item-Name']}</h3>
                        <p>${listing['Short-Description-Item']}</p>
                        <p><strong>Price:</strong> $${listing['Item-Price']}</p>
                        <p><strong>Condition:</strong> ${listing['Item-Condition']}</p>
                        <p><strong>Delivery:</strong> ${listing['Delivery-Deal']}</p>
                    </div>
                </div>
            `;
            listingsContainer.appendChild(listingElement);
        });

    } catch (error) {
        console.error("Error fetching listings:", error);
    }
});

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

/* Profile for each login user */
document.addEventListener("DOMContentLoaded", () => {
    const profileImgs = document.querySelectorAll(".profile-picture"); 

    function generateDiceBearAvatar(seed) {
        return `https://api.dicebear.com/6.x/adventurer/svg?seed=${seed}`;
    }

    let loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        console.error("No logged-in user found.");
        return;
    }

    let profileSeed = loggedInUser.email || loggedInUser.name || `user-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem("profileSeed", profileSeed);

    const profilePictureUrl = generateDiceBearAvatar(profileSeed);
    
    profileImgs.forEach(img => {
        img.src = profilePictureUrl;
    });

    console.log("Profile picture updated for:", loggedInUser.email || loggedInUser.name);
});


/* Item listing for Main Page */
document.addEventListener("DOMContentLoaded", async function () {
    console.log("✅ Fetching listings for Popular Categories...");
    const popularCategoriesContainer = document.getElementById("popular-categories-container");

    if (!popularCategoriesContainer) {
        console.error("Popular Categories container not found!");
        return;
    }

    let loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
    
    if (!loggedInUser || !loggedInUser.name) {
        console.error("No logged-in user found!");
        loggedInUser = { name: "Guest User", email: "guest@loopmart.com" }; // Default user
    }

    console.log("🔹 Logged-in User:", loggedInUser);

    function generateDiceBearAvatar(seed) {
        return `https://api.dicebear.com/6.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
    }

    const userProfileImage = generateDiceBearAvatar(loggedInUser.email || loggedInUser.name);

    async function fetchListings() {
        try {
            const response = await fetch(LISTINGS_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": API_KEY,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch listings!");

            const listingsData = await response.json();
            console.log("✅ Listings fetched:", listingsData);

            appendListings(listingsData); 
        } catch (error) {
            console.error("Error fetching listings:", error);
        }
    }

    // Append Listings to Page
    function appendListings(listings) {
        const container = document.getElementById("popular-categories-container");

        if (!container) {
            console.error("Popular Categories container not found!");
            return;
        }

        listings.forEach(listing => {
            const listingCard = document.createElement("div");
            listingCard.classList.add("listing-item");

            listingCard.innerHTML = `
                <div class="listing-header">
                    <img class="profile-img" src="${userProfileImage}" alt="Profile">
                    <div class="profile-info">
                        <p class="profile-name">${loggedInUser.name}</p>
                        <p class="time-ago">Just Now</p>
                    </div>
                </div>
                <img class="listing-img" src="${listing["Listing-Image"] || 'placeholder.jpg'}" alt="Listing Image">
                <div class="listing-details">
                    <p class="item-name"><strong>${listing["Item-Name"]}</strong></p>
                    <p class="short-desc">${listing["Short-Description-Item"]}</p>
                    <p class="price"><strong>Price:</strong> $${listing["Item-Price"] ? listing["Item-Price"].toFixed(2) : "N/A"}</p>
                    <p class="item-condition"><strong>Condition:</strong> ${listing["Item-Condition"]}</p>
                    <div class="like-section">
                        <span class="fas fa-heart"></span>
                        <p class="like-number">${Math.floor(Math.random() * 500)} likes</p>
                    </div>
                </div>
            `;

            container.appendChild(listingCard);
        });

        console.log("✅ Listings appended with the logged-in user's name.");
    }

    fetchListings();
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

// Words count
document.addEventListener("DOMContentLoaded", () => {
    const bioTextarea = document.getElementById("bioTextarea");
    const wordCountDisplay = document.getElementById("wordCount");

    bioTextarea.addEventListener("input", () => {
        const text = bioTextarea.value.trim();
        
        // Count words based on spaces or newlines
        const wordCount = text === "" ? 0 : text.split(/\s+/).length;

        // Update the word count display
        wordCountDisplay.textContent = `${wordCount}/200`;
    });
});
                        