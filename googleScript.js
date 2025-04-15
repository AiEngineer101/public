const url = 'https://westrom-agent-991313418129.us-central1.run.app/?prompt=neil degrasse tyson';  // Replace with your Cloud Function URL

const data = {
  name: 'John Doe',  // Example data you want to send
  prompt: 'Hello, Google Cloud Function!'
};

// Make the POST request using Fetch API
fetch(url, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',  // Ensure you're sending JSON data
  },
  mode: 'cors'
})
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Response from Cloud Function:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
