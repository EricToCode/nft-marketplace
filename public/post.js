// Auth redirect
fetch('/api/me').then(r => {if (r.status === 401) window.location = 'index.html';});

async function init() {
    const cats = await fetch('/api/categories').then(r => r.json());
    const sel  = document.getElementById('categorySelect');
    cats.forEach(c => sel.append(new Option(c, c)));
}

document.getElementById('postForm').onsubmit = async e => {
    e.preventDefault();
    const category = document.getElementById('categorySelect').value;
    const contractAddress=document.getElementById('contractAddressInput').value.trim();
    const tokenId  = document.getElementById('tokenIdInput').value.trim();
    const res = await fetch('/api/items', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body:JSON.stringify({category,contractAddress,tokenId})
    });
    const body = await res.json();
    const msg  = document.getElementById('msg');
    if (res.ok) {
        msg.textContent = '✅ Posted! ID: ' + body.id;
        setTimeout(() => location.href = 'browse.html', 1200);
    } else {
        msg.textContent = '❌ ' + body.error;
    }
};

init();