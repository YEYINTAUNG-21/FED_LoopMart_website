// Country Dropdown
document.getElementById('country-dropdown-btn').addEventListener('click', function() {
    const dropdownOptions = document.getElementById('country-dropdown-options');
    dropdownOptions.style.display = dropdownOptions.style.display === 'block' ? 'none' : 'block';
});

const countryOptions = document.querySelectorAll('#country-dropdown-options .option');
countryOptions.forEach(function(option) {
    option.addEventListener('click', function() {
        const selectedCountry = option.textContent;
        document.getElementById('country-input').value = selectedCountry; // Set selected value in input
        document.getElementById('country-dropdown-options').style.display = 'none'; // Hide dropdown
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
        document.getElementById('gender-input').value = selectedGender; // Set selected value in input
        document.getElementById('gender-dropdown-options').style.display = 'none'; // Hide dropdown
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