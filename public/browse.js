// Define the gateway prefix
const IPFS_GATEWAY_PREFIX = "https://gateway.pinata.cloud/ipfs/"; 

fetch('/api/me').then(r => {
  if (r.status === 401) window.location = 'index.html';
});

// --- Function to create a displayable image URL ---
function getImageUrl(ipfsUri) {
    if (!ipfsUri || !ipfsUri.startsWith("ipfs://")) {
        // Return a placeholder or null if the URI is invalid
        return null;
    }
    // Extract CID and build gateway URL
    const cid = ipfsUri.substring(7);
    return `${IPFS_GATEWAY_PREFIX}${cid}`;
}

async function load() {
  try {
    const response = await fetch('/api/items');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const items = await response.json();
    const ul = document.getElementById('list');
    const emptyMsg = document.getElementById('empty');

    ul.innerHTML = ''; // Clear previous list items

    if (!items || items.length === 0) {
      emptyMsg.style.display = 'block';
      return;
    }

    emptyMsg.style.display = 'none'; // Hide empty message if items exist

    items.forEach(item => {
      const li = document.createElement('li');

      // --- Create and add image element ---
      const img = document.createElement('img');
      const imageUrl = getImageUrl(item.front_image); // Use helper function
      if (imageUrl) {
          img.src = imageUrl;
          img.alt = item.name || 'Item image'; // Add alt text

          img.onerror = () => { img.style.display='none'; };
      } else {

          img.style.display = 'none';
      }
      li.appendChild(img);

      // --- Create and add link element ---
      const a = document.createElement('a');
      a.href = `item.html?id=${item.id}`;
      a.textContent = `${item.name || 'Unnamed Item'} (${item.category || 'N/A'}) [${item.status || 'N/A'}]`;
      li.appendChild(a); 

      ul.appendChild(li); 
    });
  } catch (error) {
    console.error("Failed to load items:", error);
    document.getElementById('list').innerHTML = '<li>Error loading items. Please try again later.</li>';
  }
}
load();