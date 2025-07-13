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
          // Store auth state in localStorage
          localStorage.setItem('userRole', 'Job Seeker');
          localStorage.setItem('userName', user.displayName || user.email);
        } else {
          // Clear stored auth state if user logs out
          if (this.userRole === "Job Seeker") {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            this.currentUser = null;
            this.userRole = null;
            this.updateNavigation();
          }
        }
      });
    }

    if (this.employerAuth) {
      this.employerAuth.onAuthStateChanged((user) => {
        if (user) {
          this.currentUser = user;
          this.userRole = "Employer";
          this.updateNavigation();
          // Store auth state in localStorage
          localStorage.setItem('userRole', 'Employer');
          localStorage.setItem('userName', user.displayName || user.email);
        } else {
          // Clear stored auth state if user logs out
          if (this.userRole === "Employer") {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            this.currentUser = null;
            this.userRole = null;
            this.updateNavigation();
          }
        }
      });
    }
  }

  setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdown = document.querySelector('.dropdown');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }

    // Handle dropdown toggle for mobile and desktop
    if (dropdownToggle && dropdown) {
      dropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove('active');
        }
      });
    }
  }

  updateNavigation() {
    const userGreeting = document.getElementById('userGreeting');
    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const postJobLink = document.getElementById('postJobLink');
    const seekerProfileLink = document.getElementById('seekerProfileLink');
    const employerProfileLink = document.getElementById('employerProfileLink');

    // Check for stored auth state if no current user
    const storedRole = localStorage.getItem('userRole');
    const storedName = localStorage.getItem('userName');
    
    if (this.currentUser || (storedRole && storedName)) {
      // User is logged in
      const displayName = this.currentUser ? 
        (this.currentUser.displayName || this.currentUser.email) : 
        storedName;
      const userRole = this.userRole || storedRole;
      
      if (userGreeting) {
        userGreeting.textContent = `Welcome, ${displayName}`;
        userGreeting.style.display = 'block';
      }
      
      if (authLinks) authLinks.style.display = 'none';
      if (userMenu) userMenu.style.display = 'block';
      
      // Show post job link only for employers
      if (postJobLink) {
        postJobLink.style.display = userRole === 'Employer' ? 'block' : 'none';
      }
      
      // Show appropriate profile links
      if (seekerProfileLink) {
        seekerProfileLink.style.display = userRole === 'Job Seeker' ? 'block' : 'none';
      }
      if (employerProfileLink) {
        employerProfileLink.style.display = userRole === 'Employer' ? 'block' : 'none';
      }
    } else {
      // User is not logged in
      if (userGreeting) userGreeting.style.display = 'none';
      if (authLinks) authLinks.style.display = 'block';
      if (userMenu) userMenu.style.display = 'none';
      if (postJobLink) postJobLink.style.display = 'none';
      if (seekerProfileLink) seekerProfileLink.style.display = 'none';
      if (employerProfileLink) employerProfileLink.style.display = 'none';
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
      
      // Clear stored auth state
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      
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
    
    const storedRole = localStorage.getItem('userRole');
    const hasAuth = this.currentUser || storedRole;

    if (protectedPages.includes(currentPage) && !hasAuth) {
      alert("Please log in to access this page.");
      window.location.href = 'login.html';
      return false;
    }

    const userRole = this.userRole || storedRole;
    if (employerOnlyPages.includes(currentPage) && userRole !== 'Employer') {
      alert("This page is only accessible to employers.");
      window.location.href = 'dashboard.html';
      return false;
    }

    if (seekerOnlyPages.includes(currentPage) && userRole !== 'Job Seeker') {
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
  
  // Initialize navigation immediately with stored state
  setTimeout(() => {
    window.navigationManager.updateNavigation();
  }, 100);
  
  // Setup logout button listeners
  document.addEventListener('click', (e) => {
    if (e.target.id === 'logoutBtn' || e.target.classList.contains('logout-btn')) {
      e.preventDefault();
      window.navigationManager.logout();
    }
  });
});