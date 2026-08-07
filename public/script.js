// Initialize values
let points = 0;
let uploads = 0;
let rewardAmount = 0;

// Get elements
const pointsDisplay = document.getElementById("points");
const uploadsDisplay = document.getElementById("uploads");
const rewardsDisplay = document.getElementById("rewards");
const fileInput = document.getElementById("trashPhoto");
const preview = document.getElementById("preview");

// Scroll to Upload Section
function scrollToUpload() {
    document.getElementById("upload").scrollIntoView({
        behavior: "smooth"
    });
}

// Preview Image
fileInput.addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
});

// Submit Upload
function submitUpload() {

    if (fileInput.files.length === 0) {
        alert("Please select a photo first!");
        return;
    }

    // Increase uploads
    uploads++;
    uploadsDisplay.textContent = uploads;

    // Increase points (10 per image)
    points += 10;
    pointsDisplay.textContent = points;

    // Reward logic (₹5 for every 10 points)
    rewardAmount = points * 0.5;
    rewardsDisplay.textContent = "₹" + rewardAmount;

    alert("Upload Successful! +10 Points 🎉");

    // Clear file input
    fileInput.value = "";

    // Remove preview image
    preview.src = "";
    preview.style.display = "none";
}

// Logout Function
function logout() {
    alert("Logged out successfully!");
    window.location.href = "login.html";
}