document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================================
  // --- FUNCȚII GLOBALE (rulat pe TOATE paginile) ---
  // ==========================================================
  
  function getUserDatabase() { return JSON.parse(localStorage.getItem("userDatabase")) || []; }
  function saveUserDatabase(db) { localStorage.setItem("userDatabase", JSON.stringify(db)); }
  function getCurrentUser() { return JSON.parse(sessionStorage.getItem("currentUser")); }
  
  function updateUser(user) {
    sessionStorage.setItem("currentUser", JSON.stringify(user));
    const db = getUserDatabase();
    const userIndex = db.findIndex(u => u.email === user.email);
    if (userIndex > -1) {
      db[userIndex] = user;
      saveUserDatabase(db);
    }
  }

  function destroySession() {
    sessionStorage.removeItem("currentUser");
    window.location.pathname = 'index.html';
  }

  function getFormattedDate(dateStr) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return date.toLocaleDateString("ro-RO", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  /**
   * ACTUALIZAT: Adaugă link-ul "Admin Panel" dacă utilizatorul este admin.
   */
  function initGlobalUserWidget() {
    const user = getCurrentUser();
    const loggedInWidget = document.getElementById("user-widget-logged-in");
    const loggedOutWidget = document.getElementById("user-widget-logged-out");

    if (user && loggedInWidget) {
      loggedOutWidget.style.display = "none";
      loggedInWidget.style.display = "block";
      document.getElementById("widget-user-email").textContent = user.email;
      document.getElementById("dropdown-user-email").textContent = user.email;
      document.getElementById("widget-user-points").textContent = `${user.points} Pcte`;
      
      const widgetBtn = document.getElementById("user-widget-btn");
      const widgetDropdown = document.getElementById("user-widget-dropdown");
      const logoutBtn = document.getElementById("widget-logout-btn");
      
      // NOU: Adaugă link-ul de admin dacă e cazul
      if (user.role === "admin" && !document.getElementById("widget-admin-link")) {
        const adminLink = document.createElement("a");
        adminLink.href = "admin.html";
        adminLink.id = "widget-admin-link";
        adminLink.textContent = "Panou Administrare";
        // Inserează înainte de butonul de logout
        logoutBtn.parentNode.insertBefore(adminLink, logoutBtn);
      }

      widgetBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        widgetDropdown.style.display = widgetDropdown.style.display === "block" ? "none" : "block";
      });
      logoutBtn.addEventListener("click", destroySession);
      
    } else if (loggedOutWidget) {
      loggedOutWidget.style.display = "block";
      loggedInWidget.style.display = "none";
    }
    
    document.addEventListener("click", (e) => {
      const widgetDropdown = document.getElementById("user-widget-dropdown");
      if (widgetDropdown && widgetDropdown.style.display === "block") {
        if (loggedInWidget && !loggedInWidget.contains(e.target)) {
          widgetDropdown.style.display = "none";
        }
      }
    });
  }


  // ==========================================================
  // --- LOGICĂ SPECIFICĂ (rulat doar pe loyalty.html) ---
  // ==========================================================
  
  function initLoyaltyPage() {
    const authContainer = document.getElementById("auth-container");
    if (!authContainer) return; // Oprește funcția dacă nu e pe pagina de loialitate

    // --- Selectrorii paginii de loialitate ---
    const loyaltyDashboard = document.getElementById("loyalty-dashboard");
    const verificationCard = document.getElementById("verification-pending-card");
    const myCodesView = document.getElementById("my-codes-view");
    const myBookingsView = document.getElementById("my-bookings-view");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const viewMyCodesBtn = document.getElementById("view-my-codes-btn");
    const viewMyBookingsBtn = document.getElementById("view-my-bookings-btn");
    const backToDashboardBtn = document.getElementById("back-to-dashboard-btn");
    const backToDashboardBtn2 = document.getElementById("back-to-dashboard-btn-2");
    const welcomeMessage = document.getElementById("welcome-message");
    const pointsDisplay = document.getElementById("points-display");
    const logoutBtn = document.getElementById("logout-btn");
    const addPointsBtn = document.getElementById("add-points-btn");
    const rewardsList = document.querySelector(".rewards-list");
    const myCodesListContainer = document.getElementById("my-codes-list-container");
    const myBookingsListContainer = document.getElementById("my-bookings-list-container");
    const verifyEmailBtn = document.getElementById("verify-email-btn");
    const verificationEmailDisplay = document.getElementById("verification-email-display");
    const showRegisterLink = document.getElementById("show-register");
    const showLoginLink = document.getElementById("show-login");

    // --- Logica de afișare a panourilor ---
    function showDashboard(user) {
      authContainer.style.display = "none";
      verificationCard.style.display = "none";
      myCodesView.style.display = "none";
      myBookingsView.style.display = "none";
      loyaltyDashboard.style.display = "block";
      welcomeMessage.textContent = `Bun venit, ${user.email}!`;
      pointsDisplay.textContent = user.points;
    }
    function showVerificationPending(user) {
      authContainer.style.display = "none";
      loyaltyDashboard.style.display = "none";
      myCodesView.style.display = "none";
      myBookingsView.style.display = "none";
      verificationCard.style.display = "block";
      verificationEmailDisplay.textContent = user.email;
    }
    function showAuthForm() {
      authContainer.style.display = "block";
      loyaltyDashboard.style.display = "none";
      myCodesView.style.display = "none";
      myBookingsView.style.display = "none";
      verificationCard.style.display = "none";
      if (loginForm) showLoginLink.click();
    }
    function showMyCodes() {
      loyaltyDashboard.style.display = "none";
      myBookingsView.style.display = "none";
      myCodesView.style.display = "block";
      renderMyCodesList();
    }
    function showMyBookings() {
      loyaltyDashboard.style.display = "none";
      myCodesView.style.display = "none";
      myBookingsView.style.display = "block";
      renderMyBookingsList();
    }

    // --- Funcțiile de randare a listelor (rămân neschimbate) ---
    function renderMyBookingsList() { /* ... (codul rămâne la fel) ... */
      const user = getCurrentUser();
      myBookingsListContainer.innerHTML = "";
      if (!user.bookings || user.bookings.length === 0) { myBookingsListContainer.innerHTML = "<p>Nu ai nicio rezervare înregistrată.</p>"; return; }
      const sortedBookings = [...user.bookings].sort((a, b) => new Date(a.date) - new Date(b.date));
      sortedBookings.forEach(booking => {
        const item = document.createElement("div"); item.classList.add("booking-item");
        const bookingDate = new Date(booking.date); const now = new Date(); let statusHtml = '';
        if (bookingDate < now) { item.classList.add("booking-item-completed"); statusHtml = `Status: <span class="status-completed">Terminată</span>`; } else { statusHtml = `Status: <span class="status-upcoming">Urmează</span>`; }
        item.innerHTML = `<h4>Data: ${new Date(booking.date).toLocaleDateString("ro-RO", {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</h4><p>Durata: ${booking.duration}</p><p>${statusHtml}</p>`;
        myBookingsListContainer.appendChild(item);
      });
    }
    function renderMyCodesList() { /* ... (codul rămâne la fel) ... */
      const user = getCurrentUser();
      myCodesListContainer.innerHTML = "";
      if (!user.vouchers || user.vouchers.length === 0) { myCodesListContainer.innerHTML = "<p>Nu ai nicio recompensă revendicată.</p>"; return; }
      const sortedVouchers = [...user.vouchers].sort((a, b) => { if (a.status === "Available" && b.status !== "Available") return -1; if (a.status !== "Available" && b.status === "Available") return 1; return 0; });
      sortedVouchers.forEach(voucher => {
        const item = document.createElement("div"); item.classList.add("voucher-item"); let html = "";
        if (voucher.status === "Available") { item.classList.add("voucher-available"); html = `<h4>${voucher.reward}</h4><p>Status: <span class="status-available">Disponibil</span></p><p class="voucher-date">Revendicat la: ${voucher.dateClaimed}</p><button class="use-code-btn" data-id="${voucher.id}">Folosește acum</button>`; } else { item.classList.add("voucher-used"); html = `<h4>${voucher.reward}</h4><p>Status: <span class="status-used">Folosit</span></p><p class="voucher-code">Cod: ${voucher.redemptionCode}</p><p class="voucher-date">Folosit la: ${voucher.dateUsed}</p>`; }
        item.innerHTML = html; myCodesListContainer.appendChild(item);
      });
    }

    // --- Logica de Autentificare (MODIFICATĂ) ---
    function toggleForms() {
      showRegisterLink.addEventListener("click", (e) => { e.preventDefault(); loginForm.style.display = "none"; registerForm.style.display = "block"; });
      showLoginLink.addEventListener("click", (e) => { e.preventDefault(); loginForm.style.display = "block"; registerForm.style.display = "none"; });
    }
    
    /**
     * ACTUALIZAT: Adaugă 'role' la înregistrare.
     */
    function handleRegister(e) {
      e.preventDefault();
      const email = document.getElementById("register-email").value;
      const pass = document.getElementById("register-pass").value;
      const passConfirm = document.getElementById("register-pass-confirm").value;
      if (pass !== passConfirm) { alert("Parolele nu se potrivesc!"); return; }
      const db = getUserDatabase();
      if (db.find(user => user.email === email)) { alert("Acest email este deja înregistrat!"); return; }
      
      // NOU: Logica pentru rolul de Admin
      const userRole = (email.toLowerCase() === 'admin@hatchet.com') ? 'admin' : 'user';

      const newUser = { email: email, password: pass, points: 10, isVerified: false, vouchers: [], bookings: [], role: userRole };
      
      db.push(newUser);
      saveUserDatabase(db);
      alert("Cont creat! Un 'email' de verificare a fost trimis.");
      createSession(newUser);
    }
    
    function handleLogin(e) {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const pass = document.getElementById("login-pass").value;
      const db = getUserDatabase();
      const foundUser = db.find(user => user.email === email && user.password === pass);
      if (foundUser) {
        createSession(foundUser);
      } else {
        alert("Email sau parolă incorectă.");
      }
    }
    
    function createSession(user) {
      sessionStorage.setItem("currentUser", JSON.stringify(user));
      // Redirecționăm la panou, care va încărca și widget-ul global
      window.location.href = "loyalty.html";
    }

    function handleVerifyEmail() { /* ... (rămâne la fel) ... */
      let user = getCurrentUser(); if (!user) return;
      user.isVerified = true; updateUser(user);
      alert("Email verificat cu succes! Bine ai venit!");
      showDashboard(user);
    }

    // --- Logica Acțiunilor din Panou (rămâne la fel) ---
    function handleAddPoints() { /* ... (rămâne la fel) ... */
      let user = getCurrentUser(); if (!user) return; user.points += 5; updateUser(user);
      pointsDisplay.textContent = user.points; document.getElementById("widget-user-points").textContent = `${user.points} Pcte`;
    }
    function handleClaimReward(e) { /* ... (rămâne la fel) ... */
      if (!e.target.classList.contains("claim-btn")) return;
      const cost = parseInt(e.target.dataset.cost); const rewardName = e.target.dataset.name;
      let user = getCurrentUser(); if (user.points < cost) { alert("Nu ai suficiente puncte!"); return; }
      user.points -= cost; const newVoucher = { id: Date.now(), reward: rewardName, dateClaimed: getFormattedDate(), status: "Available", dateUsed: null, redemptionCode: "HATCHET-DEMO" };
      if (!user.vouchers) user.vouchers = []; user.vouchers.push(newVoucher); updateUser(user);
      pointsDisplay.textContent = user.points; document.getElementById("widget-user-points").textContent = `${user.points} Pcte`;
      alert(`Recompensă revendicată!\n\nO poți vedea și folosi oricând din secțiunea "Vezi Recompensele Mele".`);
    }
    function handleUseCode(e) { /* ... (rămâne la fel) ... */
      if (!e.target.classList.contains("use-code-btn")) return;
      const isSure = confirm("Ești sigur că vrei să folosești acest voucher acum?\nOdată folosit, nu mai poate fi anulat.");
      if (!isSure) return; let user = getCurrentUser(); const voucherId = parseInt(e.target.dataset.id);
      const voucherIndex = user.vouchers.findIndex(v => v.id === voucherId); if (voucherIndex === -1) { alert("Eroare: Voucherul nu a fost găsit."); return; }
      user.vouchers[voucherIndex].status = "Used"; user.vouchers[voucherIndex].dateUsed = getFormattedDate();
      updateUser(user); const redemptionCode = user.vouchers[voucherIndex].redemptionCode;
      alert(`Voucher activat!\n\nCodul tău este: ${redemptionCode}\n\nArată acest cod la casă.`);
      renderMyCodesList();
    }

    // --- Atașarea Evenimentelor (doar pe loyalty.html) ---
    toggleForms();
    registerForm.addEventListener("submit", handleRegister);
    loginForm.addEventListener("submit", handleLogin);
    verifyEmailBtn.addEventListener("click", handleVerifyEmail);
    logoutBtn.addEventListener("click", destroySession);
    addPointsBtn.addEventListener("click", handleAddPoints);
    rewardsList.addEventListener("click", handleClaimReward);
    viewMyCodesBtn.addEventListener("click", showMyCodes);
    backToDashboardBtn.addEventListener("click", () => showDashboard(getCurrentUser()));
    myCodesListContainer.addEventListener("click", handleUseCode);
    viewMyBookingsBtn.addEventListener("click", showMyBookings);
    backToDashboardBtn2.addEventListener("click", () => showDashboard(getCurrentUser()));
    
    // --- Logica pentru ancorele din widget ---
    function handleHashChange() {
      const hash = window.location.hash; const user = getCurrentUser();
      if (!user || !user.isVerified) return;
      if (hash === '#my-rewards') { showMyCodes(); } else if (hash === '#my-bookings') { showMyBookings(); } else { showDashboard(user); }
    }
    const widgetRewardsBtn = document.getElementById("widget-view-rewards-btn");
    const widgetBookingsBtn = document.getElementById("widget-view-bookings-btn");
    const widgetDashboardBtn = document.getElementById("widget-view-dashboard-btn");
    if (widgetRewardsBtn) { widgetRewardsBtn.addEventListener("click", (e) => { e.preventDefault(); window.location.hash = 'my-rewards'; handleHashChange(); document.getElementById("user-widget-dropdown").style.display = 'none'; }); }
    if (widgetBookingsBtn) { widgetBookingsBtn.addEventListener("click", (e) => { e.preventDefault(); window.location.hash = 'my-bookings'; handleHashChange(); document.getElementById("user-widget-dropdown").style.display = 'none'; }); }
    if (widgetDashboardBtn) { widgetDashboardBtn.addEventListener("click", (e) => { e.preventDefault(); window.location.hash = 'dashboard'; handleHashChange(); document.getElementById("user-widget-dropdown").style.display = 'none'; }); }

    // --- Funcția de pornire (doar pe loyalty.html) ---
    function checkLoyaltyPageLoginState() {
      const user = getCurrentUser();
      if (user) { if (!user.isVerified) { showVerificationPending(user); } else { handleHashChange(); } } else { showAuthForm(); }
    }
    checkLoyaltyPageLoginState();
  }
  
  
  // ==========================================================
  // --- LOGICĂ SPECIFICĂ (rulat doar pe booking.html) ---
  // ==========================================================
  
  function initBookingPage() {
    const bookingForm = document.getElementById("booking-form");
    if (!bookingForm) return; // Oprește funcția dacă nu e pe pagina de rezervări
    const user = getCurrentUser();
    const loginPrompt = document.getElementById("booking-login-prompt");
    if (!user) { bookingForm.style.display = "none"; loginPrompt.style.display = "block"; } else {
      bookingForm.style.display = "flex"; loginPrompt.style.display = "none";
      document.getElementById("booking-name").value = user.email.split('@')[0];
      document.getElementById("booking-email-field").value = user.email;
      bookingForm.addEventListener("submit", handleBookingSubmit);
    }
  }
  function handleBookingSubmit(e) {
    e.preventDefault(); let user = getCurrentUser();
    if (!user) { alert("Eroare: Sesiunea a expirat. Te rugăm să te loghezi din nou."); return; }
    const date = document.getElementById("booking-date").value; const duration = document.getElementById("booking-duration").value;
    const newBooking = { bookingId: Date.now(), date: date, duration: duration, status: "upcoming" };
    if (!user.bookings) user.bookings = []; user.bookings.push(newBooking); updateUser(user);
    alert(`Rezervare confirmată!\n\nData: ${new Date(date).toLocaleDateString("ro-RO")}\nDurata: ${duration}\n\nO poți vedea oricând în panoul de loialitate, la "Rezervările Mele".`);
    e.target.reset();
  }
  

  // ==========================================================
  // --- NOU: LOGICĂ SPECIFICĂ (rulat doar pe admin.html) ---
  // ==========================================================
  
  function initAdminPage() {
    const userListContainer = document.getElementById("admin-user-list-container");
    if (!userListContainer) return; // Oprește funcția dacă nu e pe pagina de admin

    const user = getCurrentUser();
    
    // 1. Protecție/Autentificare Admin
    if (!user || user.role !== "admin") {
      alert("Acces interzis. Trebuie să fii administrator.");
      window.location.pathname = 'index.html'; // Trimite la Acasă
      return;
    }
    
    // Selectoarele paginii Admin
    const userListView = document.getElementById("admin-user-list-view");
    const editView = document.getElementById("admin-edit-view");
    const backBtn = document.getElementById("admin-back-to-list-btn");
    const editForm = document.getElementById("admin-edit-form");

    // 2. Funcția de afișare a listei de utilizatori
    function renderUserList() {
      userListView.style.display = "block";
      editView.style.display = "none";
      userListContainer.innerHTML = ""; // Golește lista
      
      const db = getUserDatabase();
      db.forEach(u => {
        const item = document.createElement("div");
        item.classList.add("user-list-item");
        item.innerHTML = `
          <div class="user-list-item-info">
            <h4>${u.email}</h4>
            <p>Puncte: ${u.points} | Rol: ${u.role}</p>
          </div>
          <button class="btn-secondary edit-user-btn" data-email="${u.email}">Editează</button>
        `;
        userListContainer.appendChild(item);
      });
    }

    // 3. Funcția care comută la panoul de editare
    function displayUserForEdit(email) {
      const db = getUserDatabase();
      const userToEdit = db.find(u => u.email === email);
      if (!userToEdit) {
        alert("Utilizatorul nu a fost găsit.");
        return;
      }
      
      // Afișează panoul de editare
      userListView.style.display = "none";
      editView.style.display = "block";
      
      // Populează formularul
      document.getElementById("admin-edit-email").value = userToEdit.email;
      document.getElementById("admin-edit-points").value = userToEdit.points;
      
      // Atenție: Folosim JSON.stringify pentru a edita array-urile
      document.getElementById("admin-edit-vouchers").value = JSON.stringify(userToEdit.vouchers || [], null, 2); // 'null, 2' formatează JSON-ul frumos
      document.getElementById("admin-edit-bookings").value = JSON.stringify(userToEdit.bookings || [], null, 2);
    }
    
    // 4. Funcția de salvare a modificărilor
    function handleSaveUser(e) {
      e.preventDefault();
      const email = document.getElementById("admin-edit-email").value;
      const db = getUserDatabase();
      const userIndex = db.findIndex(u => u.email === email);
      
      if (userIndex === -1) {
        alert("Eroare la salvare. Utilizatorul nu a fost găsit.");
        return;
      }
      
      try {
        // Preluăm datele modificate
        const newPoints = parseInt(document.getElementById("admin-edit-points").value);
        const newVouchers = JSON.parse(document.getElementById("admin-edit-vouchers").value);
        const newBookings = JSON.parse(document.getElementById("admin-edit-bookings").value);
        
        // Actualizăm "baza de date"
        db[userIndex].points = newPoints;
        db[userIndex].vouchers = newVouchers;
        db[userIndex].bookings = newBookings;
        
        // Salvăm
        saveUserDatabase(db);
        
        // Verificăm dacă adminul și-a editat propriul cont
        if (getCurrentUser().email === email) {
          updateUser(db[userIndex]); // Actualizăm și sesiunea curentă
        }
        
        alert("Utilizator salvat cu succes!");
        renderUserList(); // Ne întoarcem la listă
        
      } catch (err) {
        alert("Eroare la salvare! Verifică sintaxa JSON.\n" + err.message);
      }
    }

    // 5. Atașarea evenimentelor
    
    // Butonul "Înapoi"
    backBtn.addEventListener("click", renderUserList);
    
    // Butonul "Salvează"
    editForm.addEventListener("submit", handleSaveUser);
    
    // Butoanele "Editează" (folosind delegarea evenimentelor)
    userListContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("edit-user-btn")) {
        const email = e.target.dataset.email;
        displayUserForEdit(email);
      }
    });

    // 6. Pornirea
    renderUserList();
  }
  

  // ==========================================================
  // --- EXECUTARE SCRIPT ---
  // ==========================================================
  
  initGlobalUserWidget(); // Rulează pe TOATE paginile
  initLoyaltyPage();      // Rulează DOAR dacă e pe loyalty.html
  initBookingPage();      // Rulează DOAR dacă e pe booking.html
  initAdminPage();        // NOU: Rulează DOAR dacă e pe admin.html

});