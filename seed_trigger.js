async function run() {
  try {
    const res = await fetch("http://localhost:3000/api/debug/seed");
    console.log(res.status, await res.text());
  } catch(e) {
    console.error(e);
  }
}
run();
