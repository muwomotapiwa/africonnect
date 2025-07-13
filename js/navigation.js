// Navigation Component JavaScript
class NavigationManager {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
    this.seekerAuth = null;
    this.employerAuth = null;
    this.init();
  }

  async init() {
    await this.initializeFirebase();
    this.setupAuthListeners();
    this.setupMobileMenu();
    this.updateNavigation();
  }

  async initializeFirebase() {
    try {
      const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js");
      const { getAuth, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js");

      const seekerConfig = {
        apiKey: "AIzaSyC_7QKYXs6DPwjb7FXCffu8vuu9fXskzpc",
        authDomain: "africonnect-60a8f.firebaseapp.com",
        projectId: "africonnect-60a8f",
        storageBucket: "africonnect-60a8f.firebasestorage.app",
        messagingSenderId: "743051222212",
        appId: "1:743051222212:web:3fa4a1dc9cb54afd4d7d91"
      };

      const employerConfig = {
        apiKey: "AIzaSyBSmpkwQvSyHcUOGF6J63_MbDCkvKouPT8",
        authDomain: "africonnectemployer.firebaseapp.com",
        projectId: "africonnectemployer",
        storageBucket: "africonnectemployer.firebasestorage.app",
        messagingSenderId: "671630155008",
        appId: "1:671630155008:web:6191e14908264df047a7e5"
      };

      const seekerApp = getApps().some(app => app.name === "seeker") 
        ? getApps().find(app => app.name === "seeker") 
        : initializeApp(seekerConfig, "seeker");
      
      const employerApp = getApps().some(app => app.name === "employer") 
        ? getApps().find(app => app.name === "employer") 
        : initializeApp(employerConfig, "employer");

      this.seekerAuth = getAuth(seekerApp);
      this.employerAuth = getAuth(employerApp);
    } catch (error) {
      console.error("Firebase initialization error:", error);
    }
  }

  setupAuthListeners() {
    if (this.seekerAuth) {
      this.seekerAuth.onAuthStateChanged((user) => {
        if (user) {
          this.currentUser = user;
          this.userRole = "Job Seeker";
          this.updateNavigation();
        }
      });
    }

    if (this.employerAuth) {
      this.employerAuth.onAuthStateChanged((user) => {
        if (user) {
          this.currentUser = user;
          this.userRole = "Employer";
          this.updateNavigation();
        }
      });
    }
  }

  setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }
  }

  updateNavigation() {
    const userGreeting = document.getElementById('userGreeting');
    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const postJobLink = document.getElementById('postJobLink');

    if (this.currentUser) {
      // User is logged in
      if (userGreeting) {
        userGreeting.textContent = `Welcome, ${this.currentUser.displayName || this.currentUser.email}`;
        userGreeting.style.display = 'block';
      }
      
      if (authLinks) authLinks.style.display = 'none';
      if (userMenu) userMenu.style.display = 'block';
      
      // Show post job link only for employers
      if (postJobLink) {
        postJobLink.style.display = this.userRole === 'Employer' ? 'block' : 'none';
      }
    } else {
      // User is not logged in
      if (userGreeting) userGreeting.style.display = 'none';
      if (authLinks) authLinks.style.display = 'block';
      if (userMenu) userMenu.style.display = 'none';
      if (postJobLink) postJobLink.style.display = 'none';
    }
  }

  async logout() {
    try {
      const { signOut } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js");
      
      if (this.currentUser && this.userRole === 'Job Seeker' && this.seekerAuth) {
        await signOut(this.seekerAuth);
      } else if (this.currentUser && this.userRole === 'Employer' && this.employerAuth) {
        await signOut(this.employerAuth);
      }
      
      this.currentUser = null;
      this.userRole = null;
      this.updateNavigation();
      
      // Redirect to home page
      window.location.href = 'index.html';
    } catch (error) {
      console.error("Logout error:", error);
      alert("Error logging out. Please try again.");
    }
  }

  // Check if user should have access to current page
  checkPageAccess() {
    const currentPage = window.location.pathname.split('/').pop();
    const protectedPages = ['dashboard.html', 'post-job.html', 'profile-employer.html', 'profile-seeker.html'];
    const employerOnlyPages = ['post-job.html', 'profile-employer.html'];
    const seekerOnlyPages = ['profile-seeker.html'];

    if (protectedPages.includes(currentPage) && !this.currentUser) {
      alert("Please log in to access this page.");
      window.location.href = 'login.html';
      return false;
    }

    if (employerOnlyPages.includes(currentPage) && this.userRole !== 'Employer') {
      alert("This page is only accessible to employers.");
      window.location.href = 'dashboard.html';
      return false;
    }

    if (seekerOnlyPages.includes(currentPage) && this.userRole !== 'Job Seeker') {
      alert("This page is only accessible to job seekers.");
      window.location.href = 'dashboard.html';
      return false;
    }

    return true;
  }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.navigationManager = new NavigationManager();
  
  // Setup logout button listeners
  document.addEventListener('click', (e) => {
    if (e.target.id === 'logoutBtn' || e.target.classList.contains('logout-btn')) {
      e.preventDefault();
      window.navigationManager.logout();
    }
  });
});