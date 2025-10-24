// Let's test if we can 'fetch' from our new backend
async function testBackend() {
  console.log("Testing backend connection...");
  try {
    const response = await fetch("http://localhost:5000/api/test");
    const data = await response.json();
    console.log("Got data:", data.message);
  } catch (error) {
    console.error("Error fetching from backend:", error);
  }
}

testBackend();
