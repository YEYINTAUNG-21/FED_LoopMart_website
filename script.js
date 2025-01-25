
const API_KEY = "677f3656c7a8646786c7832f";
const NORMAL_SIGNUP_URL = "https://account-25ce.restdb.io/rest/normal-sign-up-page";
const BUSINESS_SIGNUP_URL = "https://account-25ce.restdb.io/rest/business-sign-up-page";


async function submitToRestDB(url, formData) {
    try {
        
        const data = Object.fromEntries(formData.entries());
        console.log("Submitting data to:", url);
        console.log("Form Data:", data);

       
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": API_KEY,
            },
            body: JSON.stringify(data),
        });

        
        if (response.ok) {
            const result = await response.json();
            console.log("Response from server:", result);
            return true;
        } else {
            const error = await response.json();
            console.error("Error response from server:", error);
            alert(`Error: ${error.message || "Unknown error occurred"}`);
            return false;
        }
    } catch (error) {
        console.error("Submission error:", error);
        alert("An error occurred while submitting the form.");
        return false;
    }
}


const normalForm = document.getElementById("normal-signup-form");
if (normalForm) {
    normalForm.addEventListener("submit", async (event) => {
        event.preventDefault(); 
        const success = await submitToRestDB(NORMAL_SIGNUP_URL, new FormData(normalForm));
        if (success) normalForm.reset(); 
    });
}


const businessForm = document.getElementById("business-signup-form");
if (businessForm) {
    businessForm.addEventListener("submit", async (event) => {
        event.preventDefault(); 
        const success = await submitToRestDB(BUSINESS_SIGNUP_URL, new FormData(businessForm));
        if (success) businessForm.reset(); 
    });
}