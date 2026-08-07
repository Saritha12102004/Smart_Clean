document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = {
    name: name.value,
    age: parseInt(age.value),
    email: email.value,
    password: password.value
  };

  const res = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  });

  const data = await res.json();
  alert(data.message);

  window.location.href = "login.html";
});