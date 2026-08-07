const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

document.getElementById("name").innerText = user.name;
document.getElementById("age").innerText = user.age;
document.getElementById("role").innerText = user.role;
document.getElementById("points").innerText = user.points;

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}