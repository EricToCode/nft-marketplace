// Shared frontend logic

async function onLogin() {
    // Verify session and show wallet UI
    const me = await fetch('/api/me');
    if (me.status === 401) return;
    const { username, wallet } = await me.json();
    document.getElementById('display-user').innerText = username;
    document.getElementById('auth').style.display   = 'none';
    document.getElementById('wallet').style.display = 'block';
  }
  
  document.getElementById('btnRegister').onclick = async () => {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username, password })
    });
    if (res.ok) return onLogin();
    document.getElementById('error').innerText = 'Registration failed';
  };
  
  document.getElementById('btnLogin').onclick = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username, password })
    });
    if (res.ok) return onLogin();
    document.getElementById('error').innerText = 'Login failed';
  };
  
  document.getElementById('btnConnect').onclick = async () => {
    if (!window.ethereum) return alert('Please install MetaMask.');
    const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    document.getElementById('wallet-address').innerText = address;
    await fetch('/api/connect-wallet', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ address })
    });
  };
  
  // Auto-run on index.html load
  if (document.getElementById('auth')) {
    onLogin();
  }