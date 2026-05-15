const fr = {
  app: { name: 'SyndicGest', tagline: 'Gestion de copropriété', builtBy: 'Built by ILIASFANANE' },
  nav: {
    dashboard: 'Dashboard', buildings: 'Bâtiments', residents: 'Résidents',
    payments: 'Paiements', charges: 'Charges', notifications: 'Notifications',
    admin: 'Admin', logout: 'Déconnexion', lightMode: 'Mode clair', darkMode: 'Mode sombre',
  },
  common: {
    loading: 'Chargement...', cancel: 'Annuler', save: 'Enregistrer', delete: 'Supprimer',
    close: 'Fermer', send: 'Envoyer', confirm: 'Confirmer', search: 'Rechercher...',
    all: 'Tous', none: 'Aucun', actions: 'Actions', status: 'Statut', period: 'Période',
    amount: 'Montant', contact: 'Contact', month: 'Mois', year: 'Année',
    buildings: 'bâtiments', residents: 'résidents',
    noData: 'Aucune donnée', noBuilding: 'Aucun bâtiment', noResident: 'Aucun résident',
    noPayment: 'Aucun paiement', noCharge: 'Aucune charge', noNotification: 'Aucune notification',
    noManager: 'Aucun gestionnaire',
  },
  months: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ],
  auth: {
    login: 'Se connecter', email: 'Email', password: 'Mot de passe',
    loggingIn: 'Connexion...', error: 'Email ou mot de passe incorrect',
    adminHint: 'Admin: admin@syndic.fr / admin123',
  },
  dashboard: {
    title: 'Dashboard', summary: 'Résumé financier',
    residents: 'Résidents', paid: 'Payés', pending: 'En attente', unpaid: 'Impayés',
    collected: 'Encaissé', charges: 'Charges', balance: 'Solde net',
    monthlyTitle: 'Encaissements mensuels', buildingProgress: 'Progression par bâtiment',
  },
  buildings: {
    title: 'Bâtiments', new: 'Nouveau bâtiment', edit: 'Modifier', name: 'Nom', address: 'Adresse',
    import: 'Importer Excel', importTitle: 'Importer des résidents',
    importFormat: 'Format: Prénom, Nom, Appartement, Téléphone, Email (colonnes A-E)',
    deleteConfirm: 'Supprimer ce bâtiment ? Tous les résidents, paiements et charges seront supprimés.',
    manager: 'Gestionnaire',
  },
  residents: {
    title: 'Résidents', new: 'Nouveau résident', edit: 'Modifier',
    firstName: 'Prénom', lastName: 'Nom', apartment: 'Appartement', phone: 'Téléphone', email: 'Email',
    deleteConfirm: 'Supprimer ce résident ?',
  },
  payments: {
    title: 'Paiements', declare: 'Déclarer un paiement', declareTitle: 'Déclarer un paiement',
    statusPaid: 'Payé', statusPending: 'En attente', statusUnpaid: 'Impayé',
    verify: 'Vérifier', unverify: 'Dévérifier', reset: 'Réinitialiser',
    changeStatus: 'Changer le statut', noPayment: 'Sans paiement', markUnpaid: 'Marquer impayé',
    confirmation: 'Confirmation', logs: 'Logs',
    selectResident: 'Sélectionner un résident', selectMonths: 'Sélectionner les mois',
    payNow: 'Payer directement (statut PAYÉ)', reason: 'Motif obligatoire...',
    newStatus: 'Nouveau statut', filterAll: 'Tous les statuts',
  },
  charges: {
    title: 'Charges', new: 'Nouvelle charge', edit: 'Modifier',
    description: 'Description', deleteConfirm: 'Supprimer cette charge ?',
  },
  notifications: {
    title: 'Notifications', send: 'Envoyer une notification', sendTitle: 'Envoyer une notification',
    message: 'Message', type: 'Type', sentBy: 'Envoyé par', date: 'Date',
    selectAll: 'Sélectionner tous les résidents', yourMessage: 'Votre message...',
    sent: 'Envoyée',
  },
  admin: {
    title: 'Administration', managers: 'Gestionnaires', add: 'Ajouter',
    export: 'Export Excel', exportDesc: 'Télécharger le rapport mensuel des paiements',
    download: 'Télécharger le rapport', deleteConfirm: 'Supprimer ce gestionnaire ?',
    passwordPlaceholder: 'Mot de passe', passwordEditPlaceholder: 'Nouveau mot de passe (laisser vide)',
    noBuilding: 'Aucun bâtiment',
  },
};

export default fr;
