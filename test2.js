async function run() {
  const res = await fetch("http://localhost:3000/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      email: "test3@example.com",
      password: "password123",
      csrfToken: "" // We might need a real CSRF token for NextAuth
    })
  });
  console.log(res.status, await res.text());
}
run();
