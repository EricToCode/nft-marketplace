fetch('/api/me').then(r => { if (r.status === 401) window.location = 'index.html'; });

// Get references to elements
const categorySelect = document.getElementById('categorySelect');
const watchFieldsDiv = document.getElementById('watchFields');
const cardFieldsDiv = document.getElementById('cardFields');
const mintForm = document.getElementById('mintForm');
const statusPara = document.getElementById('status');
const frontImageInput = document.getElementById('frontImage'); // Get file input elements
const backImageInput = document.getElementById('backImage');

// --- Function to update field visibility ---
function updateCategoryFields() {
  const selectedCategory = categorySelect.value;
  // Hide both first, then show the relevant one
  watchFieldsDiv.style.display = 'none';
  cardFieldsDiv.style.display = 'none';

  if (selectedCategory === 'watches') {
    watchFieldsDiv.style.display = 'block';
  } else if (selectedCategory === 'pokemon') {
    cardFieldsDiv.style.display = 'block';
  }
}

// --- Event listener for category change ---
categorySelect.addEventListener('change', updateCategoryFields);

// --- Call the function once on page load ---
document.addEventListener('DOMContentLoaded', updateCategoryFields);

// Handle mint form submission
mintForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent default form submission
  statusPara.textContent = 'Processing...';
  statusPara.className = ''; // Reset status class

  const formData = new FormData(); // Use FormData to handle multipart/form-data

  // Append common fields
  formData.append('category', categorySelect.value);
  formData.append('name', document.getElementById('name').value);
  formData.append('description', document.getElementById('description').value);

  // --- Append files with correct names ('frontImage', 'backImage') ---
  if (frontImageInput.files.length > 0) {
    formData.append('frontImage', frontImageInput.files[0]);
  } else {
     statusPara.textContent = '❌ Front image is required.';
     statusPara.className = 'error';
     return; // Stop submission if file is missing
  }
  if (backImageInput.files.length > 0) {
     formData.append('backImage', backImageInput.files[0]);
  } else {
      statusPara.textContent = '❌ Back image is required.';
      statusPara.className = 'error';
      return; // Stop submission if file is missing
  }


  // Append category-specific fields
  if (categorySelect.value === 'watches') {
    formData.append('serialNumber', document.getElementById('serialNumber').value);
    formData.append('caseColor', document.getElementById('caseColor').value);
    formData.append('dialColor', document.getElementById('dialColor').value);
  } else if (categorySelect.value === 'pokemon') {
    formData.append('rarity', document.getElementById('rarity').value);
    formData.append('setNumber', document.getElementById('setNumber').value);
  }

  statusPara.textContent = 'Uploading images and minting NFT... Please wait.';

  try {
    const response = await fetch('/api/mint-nft', {
      method: 'POST',
      body: formData // FormData sets the correct Content-Type header automatically
    });

    const body = await response.json(); // Always try to parse JSON

    if (response.ok) {
      statusPara.innerHTML = `✅ NFT minted successfully!<br>Contract: ${body.contractAddress}<br>TokenID: ${body.tokenId}<br>Tx: ${body.mintTxHash}`;
      statusPara.className = 'success';
      mintForm.reset(); // Optionally reset the form
      updateCategoryFields(); // Reset field visibility after form reset
    } else {
      // Use the error message from the server response if available
      statusPara.textContent = `❌ Error: ${body.error || `HTTP ${response.status}`}`;
      statusPara.className = 'error';
    }
  } catch (error) {
    console.error('Minting error:', error);
    statusPara.textContent = '❌ An unexpected error occurred. Check console for details.';
    statusPara.className = 'error';
  }
});