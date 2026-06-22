<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TRENDRA SHOPKART – Online Shopping for Mobiles, Fashion, Electronics & More</title>
<script src="https://www.gstatic.com/firebasejs/12.3.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore-compat.js"></script>
<script type="module" id="trendra-ai-module">
  import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
  import { getAI, getGenerativeModel, GoogleAIBackend } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-ai.js";
  import {
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
    sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink,
    updateProfile, onAuthStateChanged
  } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

  window.__trendraAIReady = (async function(){
    try{
      const cfg = {
        apiKey: "AIzaSyDsAc5vD41hb3ikubmFENRpLcvbn9OGrCQ",
        authDomain: "trendra-1890a.firebaseapp.com",
        projectId: "trendra-1890a",
        storageBucket: "trendra-1890a.firebasestorage.app",
        messagingSenderId: "678660854722",
        appId: "1:678660854722:web:652af74c5fce21b0a73c5b",
        measurementId: "G-DRG5YH7DNR"
      };
      const modularApp = getApps().length ? getApps()[0] : initializeApp(cfg);
      const ai = getAI(modularApp, { backend: new GoogleAIBackend() });
      const auth = getAuth(modularApp);

      window.__trendraAskGemini = async function(systemPrompt, history){
        const model = getGenerativeModel(ai, {
          model: "gemini-3.5-flash",
          generationConfig: { responseMimeType: "application/json" },
          systemInstruction: { role: "system", parts: [{ text: systemPrompt }] }
        });
        const contents = history.map(h=>({role:h.role, parts:[{text:h.text}]}));
        const result = await model.generateContent({ contents });
        return result.response.text();
      };

      window.__trendraAuth = {
        async signUp(email, password, name){
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          if(name) await updateProfile(cred.user, { displayName: name });
          return { uid: cred.user.uid, email: cred.user.email, name: name || email.split('@')[0] };
        },
        async signIn(email, password){
          const cred = await signInWithEmailAndPassword(auth, email, password);
          return { uid: cred.user.uid, email: cred.user.email, name: cred.user.displayName || email.split('@')[0] };
        },
        async sendEmailOtp(email){
          const actionCodeSettings = {
            url: window.location.href.split('#')[0].split('?')[0],
            handleCodeInApp: true
          };
          await sendSignInLinkToEmail(auth, email, actionCodeSettings);
          window.localStorage.setItem('trendraEmailForSignIn', email);
        },
        async completeEmailOtpIfPresent(){
          if(!isSignInWithEmailLink(auth, window.location.href)) return null;
          let email = window.localStorage.getItem('trendraEmailForSignIn');
          if(!email){
            email = window.prompt('Confirm your email to complete sign-in:');
          }
          if(!email) return null;
          const cred = await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem('trendraEmailForSignIn');
          window.history.replaceState({}, document.title, window.location.pathname);
          return { uid: cred.user.uid, email: cred.user.email, name: cred.user.displayName || email.split('@')[0] };
        }
      };

      return true;
    }catch(err){
      console.error("Trendra AI (Gemini) failed to initialize:", err);
      window.__trendraAskGemini = null;
      return false;
    }
  })();
</script>

<link rel="stylesheet" href="style.css">

</head>
<body>

<div class="offer-strip">
  <span>🚀 Free delivery on orders above ₹500</span>
  <span>⚡ New user offer: Extra 10% off</span>
  <span>📧 Contact us: trendra.care.ac.in@gmail.com</span>
  <span>🎁 Spin & Win instant coupons</span>
</div>

<header class="hdr">
  <div class="hdr-top">
    <div class="logo" onclick="goHome()">TRENDRA <sub>SHOPKART</sub></div>
    <div class="hdr-search">
      <input type="text" id="searchQ" placeholder="Search for products, brands and more">
      <button onclick="doSearch()">🔍</button>
    </div>
    <div class="hdr-nav">
      <div id="hdrUserArea">
        <button class="hdr-btn" onclick="openM('loginModal')">Login</button>
      </div>
      <div class="hdr-link" onclick="openSellerPage()" style="background:rgba(255,255,255,.1);padding:6px 14px;border-radius:20px;">🏪 Become a Seller</div>
      <div class="hdr-link" onclick="openM('baristaModal');initBarista()" style="background:rgba(255,255,255,.1);padding:6px 14px;border-radius:20px;">🤖 Trendra AI</div>
      <div class="hdr-link" onclick="openM('settingsModal')">⚙️</div>
      <div class="hdr-link" onclick="toggleNotif()">🔔<span class="badge" id="notifBadge">3</span></div>
      <div class="hdr-link" onclick="openM('wishModal');renderWishModal()">❤️<span class="badge" id="wishBadge">0</span></div>
      <div class="hdr-link" onclick="openCart()">🛒 Cart<span class="badge" id="cartBadge">0</span></div>
    </div>
  </div>
</header>

<div class="notif-panel" id="notifPanel">
  <div class="notif-hdr"><span>Notifications</span><button onclick="closeNotif()" style="background:none;font-size:18px;">✕</button></div>
  <div class="notif-item unread"><div class="notif-dot"></div><div><b>Order Shipped!</b><br>Your order #TS2024001 is on the way.</div></div>
  <div class="notif-item unread"><div class="notif-dot"></div><div><b>Coupon Earned!</b><br>You won SPIN20 – 20% off coupon.</div></div>
  <div class="notif-item unread"><div class="notif-dot"></div><div><b>Flash Sale!</b><br>Electronics up to 60% off. Hurry!</div></div>
  <div class="notif-item"><div class="notif-dot" style="background:#ccc;"></div><div><b>Delivery Done</b><br>Your order was delivered successfully.</div></div>
</div>

<div class="profile-drop" id="profileDrop">
  <div class="pd-user">
    <div class="hdr-avatar" id="pdAvatar">A</div>
    <div><b id="pdName">User</b><br><span style="font-size:11px;color:var(--muted);" id="pdEmail">user@email.com</span></div>
  </div>
  <a onclick="openM('ordersModal');renderOrdersModal()">📦 My Orders</a>
  <a onclick="openM('wishModal');renderWishModal()">❤️ Wishlist</a>
  <a onclick="openM('loginModal')">⚙️ Account Settings</a>
  <a id="adminPanelLink" style="display:none;" onclick="openAdmin()">🔧 Admin Panel</a>
  <a onclick="doLogout()" style="color:var(--red);">🚪 Logout</a>
</div>

<nav class="cat-nav">
  <div class="cat-nav-inner">
    <div class="cat-item" onclick="scrollSec('deals')"><span class="ci">🔥</span>Today's Deals</div>
    <div class="cat-item" onclick="scrollSec('mobiles')"><span class="ci">📱</span>Mobiles</div>
    <div class="cat-item" onclick="scrollSec('tvs')"><span class="ci">📺</span>TVs</div>
    <div class="cat-item" onclick="scrollSec('electronics')"><span class="ci">💻</span>Electronics</div>
    <div class="cat-item" onclick="scrollSec('fashion')"><span class="ci">👕</span>Fashion</div>
    <div class="cat-item" onclick="scrollSec('appliances')"><span class="ci">🔌</span>Appliances</div>
    <div class="cat-item" onclick="scrollSec('furniture')"><span class="ci">🛋️</span>Furniture</div>
    <div class="cat-item" onclick="scrollSec('toysbooks')"><span class="ci">🧸</span>Toys & Books</div>
    <div class="cat-item" onclick="scrollSec('grocery')"><span class="ci">🛒</span>Grocery</div>
    <div class="cat-item" onclick="openM('baristaModal');initBarista()"><span class="ci">🤖</span>Trendra AI</div>
    <div class="cat-item" onclick="openM('spinModal')"><span class="ci">🎯</span>Spin & Win</div>
  </div>
</nav>

<main>
<div class="wrap" style="margin-top:10px;">
  <div class="hero-area">
    <div class="hero-left">
      <div class="side-cat">📱 Mobiles</div><div class="side-cat">💻 Laptops</div>
      <div class="side-cat">📺 TVs & ACs</div><div class="side-cat">👗 Fashion</div>
      <div class="side-cat">🏠 Home Decor</div><div class="side-cat">🍳 Kitchen</div>
      <div class="side-cat">🧸 Toys</div><div class="side-cat">📚 Books</div>
      <div class="side-cat">💄 Beauty</div><div class="side-cat">🏋️ Sports</div>
    </div>
    <div class="hero-banner" id="heroBanner">
      <div class="hero-slide active" style="background:linear-gradient(135deg,#2874f0,#0d47a1);"><div><h1>Mega Sale Days</h1><p>Up to 70% off across all categories</p><span class="hbtn">Shop Now →</span></div></div>
      <div class="hero-slide" style="background:linear-gradient(135deg,#e91e63,#880e4f);"><div><h1>Fashion Fiesta</h1><p>Trending styles for men & women from ₹399</p><span class="hbtn">Explore Now →</span></div></div>
      <div class="hero-slide" style="background:linear-gradient(135deg,#ff6f00,#e65100);"><div><h1>Appliance Fest</h1><p>Best deals on TVs, ACs, Washing Machines</p><span class="hbtn">View Offers →</span></div></div>
      <div class="hero-slide" style="background:linear-gradient(135deg,#1b5e20,#388e3c);"><div><h1>Electronics Bonanza</h1><p>Laptops, Earbuds, Cameras & Smart Devices</p><span class="hbtn">Grab Deals →</span></div></div>
      <div class="hero-slide" style="background:linear-gradient(135deg,#4a148c,#7b1fa2);"><div><h1>Spin & Win!</h1><p>Get instant coupons — one free spin per visit</p><span class="hbtn" onclick="openM('spinModal')">Play Now 🎯</span></div></div>
      <div class="hero-dots" id="heroDots"></div>
      <div class="hero-arr prev" onclick="heroSlide(-1)">&#8249;</div>
      <div class="hero-arr next" onclick="heroSlide(1)">&#8250;</div>
    </div>
    <div class="hero-right">
      <div class="side-cat">🎁 Gift Cards</div><div class="side-cat">💊 Healthcare</div>
      <div class="side-cat">🚗 Automotive</div><div class="side-cat">🐾 Pet Supplies</div>
      <div class="side-cat">📷 Cameras</div><div class="side-cat">🎮 Gaming</div>
      <div class="side-cat">🌿 Organic</div><div class="side-cat">🎨 Art & Craft</div>
      <div class="side-cat">🧴 Personal Care</div><div class="side-cat">💼 Luggage</div>
    </div>
  </div>

  <div class="filter-bar" id="filterBar">
    <label>Sort</label>
    <select class="filter-select" id="sortSelect" onchange="applyFilters()">
      <option value="relevance">Relevance</option>
      <option value="price_low">Price: Low to High</option>
      <option value="price_high">Price: High to Low</option>
      <option value="rating">Rating: High to Low</option>
      <option value="newest">Newest First</option>
    </select>
    <label>Price</label>
    <div class="filter-group">
      <input type="number" class="filter-price" id="priceMin" placeholder="Min" onchange="applyFilters()">
      <span style="color:var(--muted);">–</span>
      <input type="number" class="filter-price" id="priceMax" placeholder="Max" onchange="applyFilters()">
    </div>
    <label>Brand</label>
    <select class="filter-select" id="brandSelect" onchange="applyFilters()">
      <option value="">All Brands</option>
    </select>
    <div class="filter-group">
      <span class="filter-chip" data-rating="4" onclick="toggleRatingChip(this)">4★ & up</span>
      <span class="filter-chip" data-rating="3" onclick="toggleRatingChip(this)">3★ & up</span>
    </div>
    <span class="filter-clear" onclick="clearFilters()">Clear Filters ✕</span>
  </div>

  <div id="searchSec" style="display:none;">
    <div class="sec" style="padding:16px;">
      <div class="sec-hdr"><div><h2>Search Results</h2><div class="sub" id="searchSub"></div></div><button class="sec-hdr view-all" onclick="clearSearch()">Clear ✕</button></div>
      <div class="prod-grid" id="srGrid"></div>
    </div>
  </div>

  <div id="pdpSec" style="display:none;"></div>

  <div id="homeSec">
    <div class="sec" id="deals">
      <div class="sec-hdr">
        <div><h2>⚡ Deals of the Day</h2><div class="sub">Limited time offers — grab fast!</div></div>
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="sec-hdr timer">Ends in <b id="countdownTime">--:--:--</b></div>
          <button class="sec-hdr view-all">View All</button>
        </div>
      </div>
      <div class="deal-strip" id="dealStrip"></div>
    </div>
    <div class="sec" id="mobiles" style="margin-top:10px;">
      <div class="sec-hdr"><div><h2>📱 Top Mobiles</h2><div class="sub">Latest smartphones from trusted brands</div></div><button class="sec-hdr view-all">View All</button></div>
      <div class="prod-scroll" id="s-mobiles"></div>
    </div>
    <div class="banner-strip">
      <div class="mini-banner" style="background:linear-gradient(135deg,#2874f0,#1a237e);" onclick="scrollSec('electronics')"><h3>Best Laptops</h3><p>Work & play smarter</p><span>From ₹32,999</span></div>
      <div class="mini-banner" style="background:linear-gradient(135deg,#e91e63,#880e4f);" onclick="scrollSec('fashion')"><h3>Fashion Sale</h3><p>Up to 80% off</p><span>Shop Now</span></div>
      <div class="mini-banner" style="background:linear-gradient(135deg,#ff6f00,#bf360c);" onclick="scrollSec('appliances')"><h3>Home Appliances</h3><p>Great deals inside</p><span>Up to 50% off</span></div>
      <div class="mini-banner" style="background:linear-gradient(135deg,#00695c,#1b5e20);" onclick="openM('spinModal')"><h3>Spin & Win</h3><p>Instant coupons!</p><span>Play Free 🎯</span></div>
    </div>
    <div class="sec" id="tvs" style="margin-top:10px;">
      <div class="sec-hdr"><div><h2>📺 Smart TVs</h2><div class="sub">4K, OLED & more</div></div><button class="sec-hdr view-all">View All</button></div>
      <div class="prod-scroll" id="s-tvs"></div>
    </div>
    <div class="sec" id="electronics" style="margin-top:10px;">
      <div class="sec-hdr"><div><h2>💻 Electronics</h2><div class="sub">Laptops, earbuds, smart devices</div></div><button class="sec-hdr view-all">View All</button></div>
      <div class="prod-scroll" id="s-electronics"></div>
    </div>
    <div class="sec" id="fashion" style="margin-top:10px;">
      <div class="sec-hdr"><div><h2>👕 Fashion Trends</h2><div class="sub">Styles for men, women & kids</div></div><button class="sec-hdr view-all">View All</button></div>
      <div class="prod-scroll" id="s-fashion"></div>
    </div>
    <div class="sec" id="appliances" style="margin-top:10px;">
      <div class="sec-hdr"><div><h2>🔌 Home Appliances</h2><div class="sub">ACs, fridges, washing machines & more</div></div><button class="sec-hdr view-all">View All</button></div>
      <div class="prod-scroll" id="s-appliances"></div>
    </div>
    <div class="sec" id="furniture" style="margin-top:10px;">
      <div class="sec-hdr"><div><h2>🛋️ Furniture & Home</h2><div class="sub">Decor, kitchen & living</div></div><button class="sec-hdr view-all">View All</button></div>
      <div class="prod-scroll" id="s-furniture"></div>
    </div>
    <div class="sec" id="toysbooks" style="margin-top:10px;">
      <div class="sec-hdr"><div><h2>🧸 Toys & Books</h2><div class="sub">For curious minds</div></div><button class="sec-hdr view-all">View All</button></div>
      <div class="prod-scroll" id="s-toysbooks"></div>
    </div>
    <div class="sec" id="grocery" style="margin-top:10px;">
      <div class="sec-hdr"><div><h2>🛒 Grocery & Sports</h2><div class="sub">Daily needs & fitness gear</div></div><button class="sec-hdr view-all">View All</button></div>
      <div class="prod-scroll" id="s-grocery"></div>
    </div>
    <div class="feature-row" style="margin-top:10px;">
      <div class="fbox"><div class="fi">🚚</div><h4>Free Delivery</h4><p>On orders above ₹500. Fast & reliable.</p></div>
      <div class="fbox"><div class="fi">↩️</div><h4>Easy Returns</h4><p>7-day hassle-free return policy.</p></div>
      <div class="fbox"><div class="fi">🔒</div><h4>Secure Payments</h4><p>100% safe UPI, Card & Net Banking.</p></div>
      <div class="fbox"><div class="fi">🏆</div><h4>Top Brands</h4><p>Millions of authentic products.</p></div>
      <div class="fbox"><div class="fi">💬</div><h4>24/7 Support</h4><p>Always here to help you out.</p></div>
    </div>
  </div>
</div>

<div class="trust-bar">
  <div class="trust-inner">
    <div class="trust-item"><div class="trust-icon">📦</div><div class="trust-info"><b>5 Crore+ Products</b><span>Across all categories</span></div></div>
    <div class="trust-item"><div class="trust-icon">🚀</div><div class="trust-info"><b>Express Delivery</b><span>In select cities</span></div></div>
    <div class="trust-item"><div class="trust-icon">💳</div><div class="trust-info"><b>EMI Available</b><span>No-cost EMI on select items</span></div></div>
    <div class="trust-item"><div class="trust-icon">✅</div><div class="trust-info"><b>100% Authentic</b><span>Only genuine products</span></div></div>
    <div class="trust-item"><div class="trust-icon">🎁</div><div class="trust-info"><b>Gift Cards</b><span>For your loved ones</span></div></div>
  </div>
</div>

<footer class="footer">
  <div class="footer-top">
    <div class="footer-col"><h5>About</h5><a>About TRENDRA SHOPKART</a><a>Careers</a><a>Press</a><a>Blog</a><a onclick="openSellerPage()">Become a Seller</a><a>Corporate Info</a></div>
    <div class="footer-col"><h5>Help</h5><a>Payments</a><a>Shipping</a><a>Cancellation & Returns</a><a>FAQ</a><a>Report Infringement</a></div>
    <div class="footer-col"><h5>Policy</h5><a>Return Policy</a><a>Terms of Use</a><a>Privacy</a><a>Sitemap</a><a>Cookie Policy</a></div>
    <div class="footer-col"><h5>Social</h5><a>Facebook</a><a>Twitter / X</a><a>Instagram</a><a>YouTube</a></div>
    <div class="footer-col"><h5>Mail Us</h5><p style="font-size:12px;line-height:1.8;">TRENDRA SHOPKART Internet Pvt Ltd,<br>Buildings Alyssa, Prayagraj,<br>Uttar Pradesh - 211001</p></div>
    <div class="footer-col"><h5>Contact</h5><div style="background:rgba(255,255,255,.08);border-radius:5px;padding:12px;font-size:12px;"><div style="margin-bottom:6px;">Email:</div><div class="upi" style="font-size:13px;">trendra.care.ac.in@gmail.com</div><div style="margin-top:8px;color:#6b8a9a;">We reply within 24 hours</div></div></div>
  </div>
  <div class="footer-bottom">© 2026 TRENDRA SHOPKART Internet Pvt. Ltd. All rights reserved. | CIN: U51109KA2024PTC001001</div>
</footer>
</main>

<div class="overlay" id="overlay" onclick="closeAll()"></div>

<aside class="cart-side" id="cartSide">
  <div class="cart-hdr"><span>🛒 My Cart</span><button onclick="closeCart()">✕</button></div>
  <div class="cart-body" id="cartBody"></div>
  <div class="cart-foot" id="cartFoot"></div>
</aside>

<div class="modal login-modal" id="loginModal">
  <button class="mclose" onclick="closeM('loginModal')">✕</button>
  <h2 id="loginTitle">Login</h2>
  <p class="lsub">Get access to your orders, wishlist & recommendations</p>
  <div class="l-tabs"><button class="act" id="tLogin" onclick="lTab('login')">Login</button><button id="tSignup" onclick="lTab('signup')">Sign Up</button></div>

  <div id="loginFields">
    <div class="lfield"><label>Email Address</label><input type="email" id="lemail" placeholder="Enter your email"></div>
    <div class="lfield"><label>Password</label><input type="password" id="lpass" placeholder="Enter password"></div>
    <button class="l-submit" id="lBtn" onclick="doLogin()">LOGIN</button>
  </div>

  <div id="signupFields" style="display:none;">
    <div class="lfield"><label>Full Name</label><input type="text" id="sname" placeholder="Your full name"></div>
    <div class="lfield"><label>Email Address</label><input type="email" id="semail" placeholder="Enter your email"></div>
    <div class="lfield"><label>Password</label><input type="password" id="spass" placeholder="Create a password (min 6 chars)"></div>
    <div class="lfield">
      <label>Verify via</label>
      <div class="otp-choice">
        <button type="button" class="otp-choice-btn act" id="otpChoiceEmail" onclick="setOtpMethod('email')">📧 Email OTP</button>
        <button type="button" class="otp-choice-btn" id="otpChoiceMobile" onclick="setOtpMethod('mobile')" disabled title="Mobile OTP coming soon">📱 Mobile OTP <span class="otp-soon">Coming soon</span></button>
      </div>
    </div>
    <div class="lfield" id="smobileRow" style="display:none;"><label>Mobile Number</label><input type="tel" id="smobile" placeholder="10-digit mobile number"></div>
    <button class="l-submit" id="signupBtn" onclick="doSignupSendOtp()">SEND VERIFICATION LINK</button>
    <p class="otp-hint" id="otpHint">We'll email you a secure sign-in link — click it to verify and create your account. No password to remember at login next time, but you can still set one above for future use.</p>
  </div>

  <div id="otpSentPanel" style="display:none;text-align:center;padding:10px 0;">
    <div style="font-size:40px;margin-bottom:8px;">📬</div>
    <h3 style="margin-bottom:6px;">Check your email</h3>
    <p class="lsub" id="otpSentMsg">We've sent a verification link to your email.</p>
    <button class="social-btn" style="margin-top:14px;width:100%;" onclick="lTab('signup')">← Back</button>
  </div>

  <div class="l-divider" id="loginDivider">OR</div>
  <div class="social-btns" id="loginSocialBtns">
    <button class="social-btn" onclick="socialLogin('Google')">🔵 Google</button>
    <button class="social-btn" onclick="socialLogin('Facebook')">🔷 Facebook</button>
  </div>
</div>

<div class="modal pd-modal" id="pdModal">
  <button class="mclose" onclick="closeM('pdModal')" style="z-index:5;">✕</button>
  <div id="pdContent" style="display:contents;"></div>
</div>

<div class="modal spin-modal" id="spinModal">
  <button class="mclose" onclick="closeM('spinModal')">✕</button>
  <h2>🎉 Spin & Win</h2>
  <p class="ssub">One free spin — instant coupon for your cart!</p>
  <div class="wheel-wrap">
    <div class="wheel-ptr"></div>
    <div class="wheel" id="wheel"></div>
    <div class="wheel-center">🎯</div>
  </div>
  <button class="spin-btn" id="spinBtn" onclick="doSpin()">SPIN NOW</button>
  <div class="spin-res" id="spinRes"></div>
</div>

<div class="modal co-modal" id="coModal">
  <button class="mclose" onclick="closeM('coModal')">✕</button>
  <div class="co-steps">
    <div class="co-step act" id="cs1"><div class="co-step-num">1</div>Address</div>
    <div class="co-line" id="cl1"></div>
    <div class="co-step" id="cs2"><div class="co-step-num">2</div>Payment</div>
    <div class="co-line" id="cl2"></div>
    <div class="co-step" id="cs3"><div class="co-step-num">3</div>Confirm</div>
  </div>
  <div class="co-body" id="coBody"></div>
</div>

<div class="modal order-ok" id="orderOkModal">
  <div class="ok-icon">🎉</div>
  <h2>Order Placed Successfully!</h2>
  <p class="osub">Thank you for shopping with ShopKart!<br>Your order will be delivered in <b>2–5 business days</b>.</p>
  <div class="order-id" id="orderIdEl">ORDER #----</div>
  <p id="orderPayInfo" style="font-size:12px;color:var(--muted);margin-bottom:6px;"></p>
  <button class="cont-btn order-ok" onclick="closeAll();renderSections();">Continue Shopping 🛍️</button>
</div>

<div class="modal wish-modal" id="wishModal">
  <button class="mclose" onclick="closeM('wishModal')">✕</button>
  <h2>❤️ My Wishlist (<span id="wishCount">0</span>)</h2>
  <div class="wish-grid" id="wishGrid"></div>
</div>

<div class="modal orders-modal" id="ordersModal">
  <button class="mclose" onclick="closeM('ordersModal')">✕</button>
  <h2>📦 My Orders</h2>
  <div id="ordersContent"></div>
</div>

<div class="modal" id="settingsModal" style="width:420px;padding:26px;">
  <button class="mclose" onclick="closeM('settingsModal')">✕</button>
  <h2 style="font-size:19px;font-weight:800;margin-bottom:4px;">⚙️ Settings</h2>
  <p style="font-size:13px;color:var(--muted);margin-bottom:18px;">Customize your ShopKart experience</p>
  <div class="set-row" style="padding:12px 0;"><span>🌙 Dark Mode</span><label class="toggle-wrap"><input type="checkbox" id="darkModeToggle" onchange="toggleDarkMode()"><span class="tog-sl"></span></label></div>
  <div class="set-row" style="padding:12px 0;"><span>🔔 Push Notifications</span><label class="toggle-wrap"><input type="checkbox" checked><span class="tog-sl"></span></label></div>
  <div class="set-row" style="padding:12px 0;"><span>📧 Email Offers</span><label class="toggle-wrap"><input type="checkbox" checked><span class="tog-sl"></span></label></div>
  <div class="set-row" style="padding:12px 0;"><span>🔊 Sound Effects</span><label class="toggle-wrap"><input type="checkbox" checked><span class="tog-sl"></span></label></div>
  <div class="set-row" style="padding:12px 0;border-bottom:none;"><span>🌐 Language</span>
    <select class="sel-sm"><option>English</option><option>हिन्दी</option></select>
  </div>
  <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);font-size:12px;color:var(--muted);">
    Contact us: <b style="color:var(--blue);">trendra.care.ac.in@gmail.com</b>
  </div>
</div>

<div class="modal pf-modal" id="pfModal">
  <button class="mclose" onclick="closeM('pfModal')">✕</button>
  <h2 id="pfTitle">Add Product</h2>
  <div class="pf-grid">
    <div class="pf-full"><label class="pf-label">Product Name</label><input class="pf-input" id="pf_name" placeholder="Full product name"></div>
    <div><label class="pf-label">Category</label>
      <select class="pf-input" id="pf_cat">
        <option value="mobiles">Mobiles</option><option value="tvs">TVs</option><option value="electronics">Electronics</option><option value="fashion">Fashion</option><option value="appliances">Appliances</option><option value="furniture">Furniture</option><option value="toys">Toys</option><option value="books">Books</option><option value="grocery">Grocery</option><option value="sports">Sports</option>
      </select>
    </div>
    <div><label class="pf-label">Emoji</label><input class="pf-input" id="pf_emoji" maxlength="4"></div>
    <div class="pf-full"><label class="pf-label">Product Photo</label>
      <input type="file" accept="image/*" class="pf-input" id="pf_photo_file" onchange="handlePhotoUpload(event)" style="padding:6px;">
      <div id="pf_photo_preview" style="margin-top:8px;display:none;">
        <img id="pf_photo_img" style="width:90px;height:90px;object-fit:cover;border-radius:6px;border:1px solid var(--border);">
        <button type="button" onclick="removePhoto()" style="margin-left:8px;background:var(--bg);color:var(--red);padding:6px 12px;border-radius:3px;font-size:12px;font-weight:700;">Remove Photo</button>
      </div>
    </div>
    <div><label class="pf-label">Selling Price ₹</label><input class="pf-input" type="number" id="pf_price"></div>
    <div><label class="pf-label">MRP ₹</label><input class="pf-input" type="number" id="pf_mrp"></div>
    <div><label class="pf-label">Stock</label><input class="pf-input" type="number" id="pf_stock"></div>
    <div><label class="pf-label">Rating (0–5)</label><input class="pf-input" type="number" step="0.1" id="pf_rating"></div>
    <div><label class="pf-label">Reviews Count</label><input class="pf-input" type="number" id="pf_reviews"></div>
    <div class="pf-full"><label class="pf-label">Description</label><textarea class="pf-input" id="pf_desc" rows="3"></textarea></div>
  </div>
  <div class="pf-actions">
    <button class="pf-cancel" onclick="closeM('pfModal')">Cancel</button>
    <button class="pf-save" onclick="saveProd()">Save Product</button>
  </div>
</div>

<div class="modal barista-modal" id="baristaModal">
  <button class="mclose" onclick="closeM('baristaModal')">✕</button>
  <div class="bar-hdr">
    <div class="bar-avatar">🤖</div>
    <div><h2>Trendra AI</h2><p class="bar-sub">Product dhundo ya kuch bhi poocho — order, delivery, return sab</p></div>
  </div>
  <div class="bar-chat" id="barChat"></div>
  <div class="bar-input-row">
    <input type="text" class="bar-input" id="barInput" placeholder="e.g. kala pant, red dress, order status..." onkeydown="if(event.key==='Enter')sendBarista()">
    <button class="bar-send" onclick="sendBarista()">➤</button>
  </div>
</div>

<div class="toast" id="toast"></div>
<button class="btt" id="btt" onclick="window.scrollTo({top:0,behavior:'smooth'})">↑</button>
<button class="spin-fab" onclick="openM('spinModal')">🎁 Spin & Win</button>

<div class="adm" id="admPanel">
  <div class="adm-top">
    <div class="adm-brand">Shop<span>Kart</span> Admin</div>
    <span style="font-size:12px;color:#6b7280;margin-right:auto;">aksahuakhil@gmail.com</span>
    <button class="adm-top-btn" onclick="exitAdmin()">← Back to Store</button>
    <button class="adm-top-btn danger" onclick="logoutAdmin()">Logout</button>
  </div>
  <div class="adm-body">
    <aside class="adm-side">
      <div class="ns">Main</div>
      <button class="adm-nav on" onclick="admNav('dashboard',this)">📊 Dashboard</button>
      <button class="adm-nav" onclick="admNav('orders',this)">📦 Orders</button>
      <div class="ns">Catalogue</div>
      <button class="adm-nav" onclick="admNav('products',this)">🛍️ Products</button>
      <button class="adm-nav" onclick="admNav('inventory',this)">📋 Inventory</button>
      <div class="ns">Business</div>
      <button class="adm-nav" onclick="admNav('customers',this)">👥 Customers</button>
      <button class="adm-nav" onclick="admNav('sellerreq',this)">🏪 Seller Requests</button>
      <button class="adm-nav" onclick="admNav('payments',this)">💰 Payments</button>
      <button class="adm-nav" onclick="admNav('coupons',this)">🎁 Coupons</button>
      <div class="ns">Config</div>
      <button class="adm-nav" onclick="admNav('settings',this)">⚙️ Settings</button>
    </aside>
    <div class="adm-content">
      <div class="adm-page on" id="pg-dashboard">
        <div class="adm-title">Dashboard</div>
        <div class="stat-grid">
          <div class="scard"><div class="sc-icon" style="background:#dbeafe;">💰</div><div class="sc-info"><div class="lbl">Total Revenue</div><div class="val" id="st-rev">₹0</div><div class="chg chg-up">↑ 18% this month</div></div></div>
          <div class="scard"><div class="sc-icon" style="background:#dcfce7;">📦</div><div class="sc-info"><div class="lbl">Total Orders</div><div class="val" id="st-ord">0</div><div class="chg chg-up">↑ 12% this month</div></div></div>
          <div class="scard"><div class="sc-icon" style="background:#fef9c3;">🛍️</div><div class="sc-info"><div class="lbl">Products</div><div class="val" id="st-prd">0</div><div class="chg chg-up">Active listings</div></div></div>
          <div class="scard"><div class="sc-icon" style="background:#fce7f3;">👥</div><div class="sc-info"><div class="lbl">Customers</div><div class="val" id="st-cst">0</div><div class="chg chg-up">↑ 8% this month</div></div></div>
        </div>
        <div class="chart-grid">
          <div class="ch-card"><h3>📈 Revenue – Last 7 Days</h3><div class="bar-chart" id="revChart"></div></div>
          <div class="ch-card"><h3>🥧 Sales by Category</h3><div class="donut-wr" id="catChart"></div></div>
        </div>
        <div class="adm-card"><div class="adm-card-hdr"><span class="adm-card-title">Recent Orders</span></div>
          <div class="adm-tbl-wrap"><table class="atbl"><thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead><tbody id="dshOrders"></tbody></table></div>
        </div>
      </div>
      <div class="adm-page" id="pg-orders">
        <div class="adm-title">Orders <button class="adm-btn" onclick="exportCSV()">⬇ Export CSV</button></div>
        <div class="adm-card">
          <div class="adm-card-hdr">
            <input class="adm-srch" placeholder="Search orders..." oninput="filterOrders(this.value)">
            <select class="sel-sm" onchange="filterOrderStat(this.value)"><option value="">All Status</option><option>pending</option><option>paid</option><option>shipped</option><option>delivered</option><option>cancelled</option></select>
          </div>
          <div class="adm-tbl-wrap"><table class="atbl"><thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Method</th><th>Status</th><th>Date</th><th>Action</th></tr></thead><tbody id="ordTbl"></tbody></table></div>
        </div>
      </div>
      <div class="adm-page" id="pg-products">
        <div class="adm-title">Products <button class="adm-btn" onclick="openPF(null)">+ Add Product</button></div>
        <div class="adm-card">
          <div class="adm-card-hdr"><input class="adm-srch" placeholder="Search products..." oninput="filterProds(this.value)"></div>
          <div class="adm-tbl-wrap"><table class="atbl"><thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>MRP</th><th>Disc</th><th>Rating</th><th>Stock</th><th>Actions</th></tr></thead><tbody id="prdTbl"></tbody></table></div>
        </div>
      </div>
      <div class="adm-page" id="pg-inventory">
        <div class="adm-title">Inventory</div>
        <div class="adm-card">
          <div class="adm-card-hdr"><input class="adm-srch" placeholder="Search..." oninput="filterInv(this.value)"></div>
          <div class="adm-tbl-wrap"><table class="atbl"><thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Status</th><th>Update</th></tr></thead><tbody id="invTbl"></tbody></table></div>
        </div>
      </div>
      <div class="adm-page" id="pg-customers">
        <div class="adm-title">Customers</div>
        <div class="adm-card">
          <div class="adm-card-hdr"><input class="adm-srch" placeholder="Search customers..." oninput="filterCusts(this.value)"></div>
          <div class="adm-tbl-wrap"><table class="atbl"><thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>City</th><th>Orders</th><th>Spent</th><th>Joined</th></tr></thead><tbody id="custTbl"></tbody></table></div>
        </div>
      </div>
      <div class="adm-page" id="pg-sellerreq">
        <div class="adm-title">Seller Requests <span id="sellerReqCount" style="font-size:12px;color:var(--muted);font-weight:600;"></span></div>
        <div class="adm-card">
          <div class="adm-card-hdr">
            <input class="adm-srch" placeholder="Search by name or business..." oninput="filterSellerReq(this.value)">
            <select class="sel-sm" onchange="filterSellerReqStat(this.value)"><option value="">All Status</option><option value="pending">pending</option><option value="accepted">accepted</option><option value="rejected">rejected</option></select>
          </div>
          <div id="sellerReqList" style="padding:6px 0;"></div>
        </div>
      </div>
      <div class="adm-page" id="pg-payments">
        <div class="adm-title">Payments & Transactions</div>
        <div class="stat-grid">
          <div class="scard"><div class="sc-icon" style="background:#dbeafe;">📲</div><div class="sc-info"><div class="lbl">UPI Received</div><div class="val" id="pay-upi">₹0</div></div></div>
          <div class="scard"><div class="sc-icon" style="background:#dcfce7;">💳</div><div class="sc-info"><div class="lbl">Card Payments</div><div class="val" id="pay-card">₹0</div></div></div>
          <div class="scard"><div class="sc-icon" style="background:#f3e5f5;">🏦</div><div class="sc-info"><div class="lbl">Net Banking</div><div class="val" id="pay-net">₹0</div></div></div>
          <div class="scard"><div class="sc-icon" style="background:#fff8e1;">💵</div><div class="sc-info"><div class="lbl">COD Pending</div><div class="val" id="pay-cod">₹0</div></div></div>
        </div>
        <div class="adm-card">
          <div class="adm-card-hdr"><div class="adm-card-title">UPI ID: <b style="color:var(--blue);">9125442370-2@ybl</b></div></div>
          <div class="adm-tbl-wrap"><table class="atbl"><thead><tr><th>Txn ID</th><th>Order</th><th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead><tbody id="payTbl"></tbody></table></div>
        </div>
      </div>
      <div class="adm-page" id="pg-coupons">
        <div class="adm-title">Coupons & Offers</div>
        <div class="adm-card">
          <div class="adm-card-hdr"><div class="adm-card-title">Active Coupons</div></div>
          <div class="adm-tbl-wrap"><table class="atbl"><thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Usage</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td><b>SPIN5</b></td><td>% Discount</td><td>5%</td><td>₹0</td><td>Auto</td><td><span class="sbadge sb-paid">Active</span></td></tr>
            <tr><td><b>SPIN10</b></td><td>% Discount</td><td>10%</td><td>₹0</td><td>Auto</td><td><span class="sbadge sb-paid">Active</span></td></tr>
            <tr><td><b>SPIN15</b></td><td>% Discount</td><td>15%</td><td>₹0</td><td>Auto</td><td><span class="sbadge sb-paid">Active</span></td></tr>
            <tr><td><b>SPIN20</b></td><td>% Discount</td><td>20%</td><td>₹0</td><td>Auto</td><td><span class="sbadge sb-paid">Active</span></td></tr>
            <tr><td><b>FLAT100</b></td><td>Flat ₹ Off</td><td>₹100</td><td>₹500</td><td>Auto</td><td><span class="sbadge sb-paid">Active</span></td></tr>
            <tr><td><b>FREESHIP</b></td><td>Free Shipping</td><td>Free</td><td>₹0</td><td>Auto</td><td><span class="sbadge sb-paid">Active</span></td></tr>
            <tr><td><b>NEW10</b></td><td>% Discount</td><td>10%</td><td>₹200</td><td>New Users</td><td><span class="sbadge sb-paid">Active</span></td></tr>
          </tbody></table></div>
        </div>
      </div>
      <div class="adm-page" id="pg-settings">
        <div class="adm-title">Settings</div>
        <div class="set-grid">
          <div class="set-card"><h3>🏪 Store Info</h3>
            <div class="set-row"><span>Store Name</span><input class="set-input" value="ShopKart"></div>
            <div class="set-row"><span>UPI ID</span><input class="set-input" style="width:200px;font-size:12px;font-family:monospace;" value="9125442370-2@ybl"></div>
            <div class="set-row"><span>Admin Email</span><input class="set-input" style="width:200px;font-size:12px;" value="aksahuakhil@gmail.com"></div>
            <div class="set-row"><span>Currency</span><input class="set-input" value="INR (₹)"></div>
          </div>
          <div class="set-card"><h3>⚙️ Store Toggles</h3>
            <div class="set-row"><span>COD Enabled</span><label class="toggle-wrap"><input type="checkbox" checked><span class="tog-sl"></span></label></div>
            <div class="set-row"><span>UPI Payments</span><label class="toggle-wrap"><input type="checkbox" checked><span class="tog-sl"></span></label></div>
            <div class="set-row"><span>Spin & Win</span><label class="toggle-wrap"><input type="checkbox" checked><span class="tog-sl"></span></label></div>
            <div class="set-row"><span>Sale Banner</span><label class="toggle-wrap"><input type="checkbox" checked><span class="tog-sl"></span></label></div>
            <div class="set-row"><span>Maintenance Mode</span><label class="toggle-wrap"><input type="checkbox"><span class="tog-sl"></span></label></div>
          </div>
          <div class="set-card"><h3>🚚 Delivery Config</h3>
            <div class="set-row"><span>Free delivery above</span><input class="set-input" value="₹500"></div>
            <div class="set-row"><span>Standard fee</span><input class="set-input" value="₹40"></div>
            <div class="set-row"><span>COD handling fee</span><input class="set-input" value="₹20"></div>
            <div class="set-row"><span>Expected days</span><input class="set-input" value="2–5 days"></div>
          </div>
          <div class="set-card"><h3>🔐 Admin Access</h3>
            <div class="set-row"><span>Admin Email</span><b style="font-size:12px;color:var(--blue);">aksahuakhil@gmail.com</b></div>
            <div class="set-row"><span>Password</span><span style="font-size:12px;color:var(--muted);">••••••••</span></div>
            <div class="set-row"><span>Two-Factor Auth</span><label class="toggle-wrap"><input type="checkbox"><span class="tog-sl"></span></label></div>
            <div class="set-row"><span>Session Timeout</span><input class="set-input" value="30 min"></div>
          </div>
        </div>
        <div style="margin-top:14px;"><button class="adm-btn" onclick="saveAllSettings()">Save All Settings</button></div>
      </div>
    </div>
  </div>
</div>

<div class="seller-page" id="sellerPage">
  <div class="seller-top">
    <div class="logo">TRENDRA <sub>SHOPKART</sub></div>
    <button class="seller-close" onclick="closeSellerPage()">← Back to Store</button>
  </div>

  <div class="seller-hero">
    <h1>Grow your business with <span>TRENDRA SHOPKART</span></h1>
    <p>Join thousands of sellers reaching millions of customers across India. Zero setup fee, easy onboarding, and payouts every week.</p>
    <div class="seller-cta-row">
      <button class="seller-cta-primary" onclick="document.getElementById('sellerFormCard').scrollIntoView({behavior:'smooth'})">Start Selling Today →</button>
      <button class="seller-cta-secondary" onclick="document.getElementById('sellerBenefits').scrollIntoView({behavior:'smooth'})">Learn More</button>
    </div>
  </div>

  <div class="seller-stats">
    <div class="seller-stat"><div class="num">5 Cr+</div><div class="lbl">Active Customers</div></div>
    <div class="seller-stat"><div class="num">2 Lakh+</div><div class="lbl">Sellers Onboarded</div></div>
    <div class="seller-stat"><div class="num">15,000+</div><div class="lbl">Pin Codes Covered</div></div>
    <div class="seller-stat"><div class="num">Weekly</div><div class="lbl">Payout Cycle</div></div>
  </div>

  <div class="seller-benefits" id="sellerBenefits">
    <h2>Why sell with us?</h2>
    <div class="seller-benefit-grid">
      <div class="seller-benefit-card"><div class="icon">💰</div><h4>Low Commission</h4><p>Competitive commission rates starting as low as 4%, no hidden charges.</p></div>
      <div class="seller-benefit-card"><div class="icon">🚚</div><h4>Logistics Support</h4><p>We handle pickup, packaging guidance and delivery across India.</p></div>
      <div class="seller-benefit-card"><div class="icon">📊</div><h4>Seller Dashboard</h4><p>Track orders, inventory and earnings in real time from one place.</p></div>
      <div class="seller-benefit-card"><div class="icon">💳</div><h4>Fast Payments</h4><p>Get your payouts deposited directly to your bank every week.</p></div>
      <div class="seller-benefit-card"><div class="icon">🎯</div><h4>Marketing Reach</h4><p>Get featured in deals, banners and personalized recommendations.</p></div>
      <div class="seller-benefit-card"><div class="icon">🛡️</div><h4>Buyer Protection</h4><p>Secure transactions and dispute resolution support for sellers.</p></div>
    </div>
  </div>

  <div class="seller-steps">
    <h2>How it works</h2>
    <div class="seller-step-row">
      <div class="seller-step"><div class="seller-step-num">1</div><h4>Register</h4><p>Fill the form with your business details</p></div>
      <div class="seller-step"><div class="seller-step-num">2</div><h4>Verify</h4><p>Submit GST & bank details for verification</p></div>
      <div class="seller-step"><div class="seller-step-num">3</div><h4>List Products</h4><p>Upload your catalogue with prices & photos</p></div>
      <div class="seller-step"><div class="seller-step-num">4</div><h4>Start Selling</h4><p>Receive orders and grow your business</p></div>
    </div>
  </div>

  <div class="seller-form-wrap">
    <div class="seller-form-card" id="sellerFormCard">
      <div id="sellerFormContent"></div>
    </div>
  </div>
</div>

<script src="app.js"></script>
</body>
</html>
