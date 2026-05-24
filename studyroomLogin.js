<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Login - Booogle</title>
  <link rel="stylesheet" href="/css/login.css">
  <script src="/js/runtime-config.js"></script>
</head>
<body>
  <section>
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
    <div class="container">
      <input type="checkbox" id="flip">
      <div class="cover">
        <div class="front" style="background-image: url('https://wallpapers.com/images/hd/purple-gradient-background-2560-x-1280-bw47mvabspav8twy.jpg');">
          <img src="https://wallpapers.com/images/hd/purple-gradient-background-2560-x-1280-bw47mvabspav8twy.jpg" alt="">
          <div class="text">
            <div class="text-1">Track your PDF reading progress<br>with Booogle</div>
            <div class="text-2">Let's get started with your study journey</div>
          </div>
        </div>
        <div class="back">
          <div class="text">
            <div class="text-1">Boost your learning<br>with BOOOGLE</div><br><br>
            <div class="text-1">Save your progress<br>across all devices</div>
            <div class="text-2">Let's get connected</div>
          </div>
        </div>
      </div>

      <div class="forms">
        <div class="form-content">
          <!-- LOGIN FORM -->
          <div class="login-form">
            <div class="title">Login</div>
            <form id="loginForm">
              <div class="input-boxes">
                <div class="input-box">
                  <i class="fas fa-envelope"></i>
                  <input type="email" id="loginEmail" placeholder="Enter your email" required>
                </div>
                <div class="input-box">
                  <i class="fas fa-lock"></i>
                  <input type="password" id="loginPassword" placeholder="Enter your password" required>
                </div>
                <div class="text" style="color: #0f0;"><a href="#">Forgot password?</a></div>
                <div id="loginError" style="color: #ff4444; font-size: 14px; margin: 10px 0; display: none;"></div>
                <div class="button input-box">
                  <input type="submit" value="Login">
                </div>
                <div class="text sign-up-text">Don't have an account? <label for="flip">Signup now</label></div>
              </div>
            </form>
          </div>

          <!-- SIGNUP FORM -->
          <div class="signup-form">
            <div class="title">Signup</div>
            <form id="signupForm">
              <div class="input-boxes">
                <div class="input-box">
                  <i class="fas fa-user"></i>
                  <input type="text" id="signupUsername" placeholder="Enter username" required>
                </div>
                <div class="input-box">
                  <i class="fas fa-envelope"></i>
                  <input type="email" id="signupEmail" placeholder="Enter your email" required>
                </div>
                <div class="input-box">
                  <i class="fas fa-lock"></i>
                  <input type="password" id="signupPassword" placeholder="Enter your password (min 6 chars)" required minlength="6">
                </div>
                <div id="signupError" style="color: #ff4444; font-size: 14px; margin: 10px 0; display: none;"></div>
                <div class="button input-box">
                  <input type="submit" value="Signup">
                </div>
                <div class="text sign-up-text">Already have an account? <label for="flip">Login now</label></div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- API Diagnostics (helps debug Netlify / 404 issues) -->
  <div style="max-width:900px;margin: 1rem auto; padding: 1rem; border-radius:8px; background: #fff; box-shadow: 0 6px 18px rgba(0,0,0,0.06); font-family: system-ui, -apple-system, 'Segoe UI', Roboto;">
    <h3 style="margin:0 0 0.75rem 0; font-size:16px;">🔧 API diagnostics</h3>
    <div style="font-size:13px; color:#333; margin-bottom:0.5rem">This shows what the page thinks your backend API URL is and lets you test connectivity. If the test returns Netlify's "Page not found" HTML, your site is calling a path that Netlify is serving instead of your backend.</div>
    <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem;">
      <div style="font-size:13px; color:#666;">API URL:</div>
      <code id="diagnosticApiUrl" style="background:#f5f5f5; padding:6px 8px; border-radius:6px; font-size:13px;">-</code>
      <button id="testApiBtn" style="margin-left:auto; padding:6px 10px; border-radius:6px; border:none; background:#2563eb; color:white; cursor:pointer;">Test API</button>
    </div>
    <div id="diagnosticResult" style="font-family:monospace; font-size:12px; white-space:pre-wrap; color:#222; background:#111; color:#fff; padding:8px; border-radius:6px; min-height:48px; display:block">No test run yet.</div>
    <div style="font-size:12px; color:#666; margin-top:0.5rem">If the result contains HTML with "Page not found" or other Netlify text, set your API host with a <code>&lt;meta name="api-base" content="https://api.example.com"&gt;</code> in your HTML or configure Netlify to proxy <code>/api/*</code> to your backend.</div>
  </div>

  <script>
    const API_URL = window.API_URL || (window.location.origin + '/api');

    // LOGIN FORM
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const errorDiv = document.getElementById('loginError');
      const submitBtn = e.target.querySelector('input[type="submit"]');
      
      try {
        submitBtn.disabled = true;
        submitBtn.value = 'Logging in...';
        errorDiv.style.display = 'none';
        
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        let data = null;
        // If HTTP error (non-2xx) try to read and show server message
        if (!response.ok) {
          const text = await response.text().catch(() => null);
          try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
          const message = data?.message || text || `Request failed (${response.status})`;
          errorDiv.textContent = message;
          errorDiv.style.display = 'block';
          return;
        }

        data = await response.json();

        if (data && data.success) {
          // Save token and user data
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          alert('✅ Login successful!');
          
          // Redirect to home/cart page
          window.location.href = '/html/ham.html';
        } else {
          errorDiv.textContent = (data && data.message) || 'Invalid credentials';
          errorDiv.style.display = 'block';
        }
      } catch (error) {
        errorDiv.textContent = 'Connection error. Please try again.';
        errorDiv.style.display = 'block';
        console.error('Login error:', error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.value = 'Login';
      }
    });

    // SIGNUP FORM
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('signupUsername').value;
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      const errorDiv = document.getElementById('signupError');
      const submitBtn = e.target.querySelector('input[type="submit"]');
      
      try {
        submitBtn.disabled = true;
        submitBtn.value = 'Creating account...';
        errorDiv.style.display = 'none';
        
        const response = await fetch(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, fullName: username })
        });
        
        let data = null;
        if (!response.ok) {
          const text = await response.text().catch(() => null);
          try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
          const message = data?.message || text || `Request failed (${response.status})`;
          errorDiv.textContent = message;
          errorDiv.style.display = 'block';
          return;
        }

        data = await response.json();

        if (data && data.success) {
          // Save token and user data
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          alert('✅ Account created successfully!');
          
          // Redirect to home/cart page
          window.location.href = '/html/ham.html';
        } else {
          errorDiv.textContent = (data && data.message) || 'Signup failed';
          errorDiv.style.display = 'block';
        }
      } catch (error) {
        errorDiv.textContent = 'Connection error. Please try again.';
        errorDiv.style.display = 'block';
        console.error('Signup error:', error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.value = 'Signup';
      }
    });

    // DIAGNOSTICS: show API_URL and wire Test API button
    const diagApiUrlEl = document.getElementById('diagnosticApiUrl');
    const diagResultEl = document.getElementById('diagnosticResult');
    const testBtn = document.getElementById('testApiBtn');
    if (diagApiUrlEl) diagApiUrlEl.textContent = API_URL;

    if (testBtn) testBtn.addEventListener('click', async () => {
      diagResultEl.textContent = 'Testing ' + API_URL + ' ...';
      try {
        // Try a GET to the API root - most servers will return a helpful status body
        const r = await fetch(API_URL, { method: 'GET' });
        const statusLine = `Status: ${r.status} ${r.statusText} (ok=${r.ok})`;
        const ct = r.headers.get('content-type') || '';
        let body = await r.text().catch(() => null);
        if (body && body.length > 1200) body = body.slice(0, 1200) + '\n\n... (truncated)';
        diagResultEl.textContent = statusLine + '\nContent-Type: ' + ct + '\n\n' + (body || '(empty response)');
      } catch (err) {
        diagResultEl.textContent = 'Network or CORS error: ' + (err && err.message ? err.message : String(err));
      }
    });

    // Check if already logged in
    if (localStorage.getItem('token')) {
      window.location.href = '/html/ham.html';
    }
  </script>
</body>
</html>