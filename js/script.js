// ============================================================
// script.js — Un cocon de joie · Vue 3 CDN
// Formulaire : Formspree (https://formspree.io)
// ============================================================
const { createApp } = Vue;

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mlgwpbvj';

createApp({
  data() {
    return {
      // ── Navigation ──
      menuOpen:   false,
      isScrolled: false,

      // ── FAQ accordion ──
      faqOpen: null,

      // ── Formulaire ──
      form: {
        prenom:    '',
        nom:       '',
        email:     '',
        telephone: '',
        type:      '',
        message:   '',
        _honey:    '',   // honeypot — ne jamais afficher ce champ à l'utilisateur
      },
      formErrors:     {},
      formSubmitting: false,
      toastVisible:   false,
      toastMessage:   '',
      toastError:     false,
    };
  },

  mounted() {
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.onScroll();

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        this.menuOpen = false;
        document.body.style.overflow = '';
      }
    });

    this.markActiveLink();
    this.initAnimations();
  },

  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  },

  methods: {
    // ── NAV ──
    onScroll() {
      this.isScrolled = window.scrollY > 60;
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
      document.body.style.overflow = this.menuOpen ? 'hidden' : '';
    },
    closeMenu() {
      this.menuOpen = false;
      document.body.style.overflow = '';
    },
    markActiveLink() {
      const page = window.location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.nav__link, .mobile-menu__link').forEach(el => {
        const href = el.getAttribute('href') || '';
        if (href && href !== '#' && page && href.includes(page.replace('#', ''))) {
          el.classList.add('is-active');
        }
      });
    },

    // ── FAQ ──
    toggleFaq(i) {
      this.faqOpen = this.faqOpen === i ? null : i;
    },
    isFaqOpen(i) {
      return this.faqOpen === i;
    },

    // ── FORMULAIRE ──
    validateForm() {
      this.formErrors = {};
      if (!this.form.prenom.trim())  this.formErrors.prenom = 'Champ requis';
      if (!this.form.nom.trim())     this.formErrors.nom    = 'Champ requis';
      if (!this.form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        this.formErrors.email = 'Email invalide';
      }
      if (!this.form.type) this.formErrors.type = 'Veuillez sélectionner';
      return Object.keys(this.formErrors).length === 0;
    },

    async submitForm() {
      // 1. Honeypot : si le champ caché est rempli → c'est un bot, on ignore
      if (this.form._honey) return;

      // 2. Validation front
      if (!this.validateForm()) return;

      // 3. Envoi vers Formspree
      this.formSubmitting = true;

      try {
        const payload = {
          Prénom:     this.form.prenom,
          Nom:        this.form.nom,
          Email:      this.form.email,
          Téléphone:  this.form.telephone || 'Non renseigné',
          'Type de soin': this.form.type,
          Message:    this.form.message || 'Aucun message',
        };

        const response = await fetch(FORMSPREE_ENDPOINT, {
          method:  'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });

        if (response.ok) {
          // Succès : reset + toast vert
          this.form = { prenom: '', nom: '', email: '', telephone: '', type: '', message: '', _honey: '' };
          this.formErrors = {};
          this.showToast('✓ Message envoyé ! Léa vous répond rapidement.', false);
        } else {
          // Erreur serveur Formspree
          const data = await response.json().catch(() => ({}));
          const msg = data.errors ? data.errors.map(e => e.message).join(', ') : 'Erreur lors de l\'envoi.';
          this.showToast('⚠ ' + msg, true);
        }
      } catch (err) {
        // Erreur réseau
        this.showToast('⚠ Connexion impossible. Essayez par téléphone.', true);
      } finally {
        this.formSubmitting = false;
      }
    },

    showToast(message, isError = false) {
      this.toastMessage = message;
      this.toastError   = isError;
      this.toastVisible = true;
      setTimeout(() => { this.toastVisible = false; }, isError ? 6000 : 4500);
    },

    // ── ANIMATIONS ──
    initAnimations() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('is-visible');
              observer.unobserve(e.target);
            }
          });
        },
        { threshold: 0.10, rootMargin: '0px 0px -30px 0px' }
      );
      document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    },
  },
}).mount('#app');
