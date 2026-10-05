async function run() {
  const res = await fetch("http://localhost:3000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User 3",
      email: "test3@example.com",
      password: "password123",
      role: "STUDENT"
    })
  });
  console.log(res.status, await res.text());
}
run();
