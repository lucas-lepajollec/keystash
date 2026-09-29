export type Locale = 'en' | 'fr' | 'es' | 'de';

export const LOCALES: Locale[] = ['en', 'fr', 'es', 'de'];

export interface Translations {
  appName: string;
  vault: string;

  /* Search */
  searchPlaceholder: string;
  searchLabel: string;
  clearSearch: string;

  /* Categories */
  allCategories: string;
  categoriesLabel: string;
  sidebarLabel: string;
  revealAll: string;
  hideAll: string;
  overviewTitle: string;
  statSecrets: string;
  statCategories: string;
  statLastUpdate: string;
  never: string;

  /* Header actions */
  newSecret: string;
  lockVault: string;
  themeToggle: string;
  language: string;
  totalSecrets: string;

  /* List */
  copy: string;
  copied: string;
  copyAria: string;
  reveal: string;
  hide: string;
  revealAria: string;
  actions: string;
  edit: string;
  delete: string;
  deleteAria: string;
  listLabel: string;
  emptyTitle: string;
  emptySubtitle: string;
  addSecret: string;
  noResultsTitle: string;
  noResultsSubtitle: string;
  loadingVault: string;
  resultsCount: string;

  /* Create / edit sheet */
  modalNewTitle: string;
  modalEditTitle: string;
  closeSheet: string;
  fieldTitle: string;
  fieldNamePlaceholder: string;
  fieldSecret: string;
  fieldSecretPlaceholder: string;
  fieldSecretUnchanged: string;
  fieldSecretKeepHint: string;
  fieldCategory: string;
  fieldCategoryPlaceholder: string;
  fieldTags: string;
  fieldTagsPlaceholder: string;
  fieldNotes: string;
  fieldNotesPlaceholder: string;
  generateToken: string;
  save: string;
  saving: string;
  cancel: string;

  /* Delete confirmation */
  confirmDeleteTitle: string;
  confirmDeleteMessage: string;

  /* Setup */
  setupTitle: string;
  setupSubtitle: string;
  setupButton: string;
  masterPasswordLabel: string;
  confirmPasswordLabel: string;
  masterPasswordPlaceholder: string;
  passwordPlaceholder: string;

  /* Login */
  loginTitle: string;
  loginSubtitle: string;
  loginButton: string;

  /* Errors */
  fieldRequired: string;
  passwordMismatch: string;
  passwordTooShort: string;
  invalidPassword: string;
  rateLimited: string;
  connectionError: string;
  setupFailed: string;
  saveFailed: string;
  loading: string;
}

export const translations: Record<Locale, Translations> = {
  en: {
    appName: 'KeyStash',
    vault: 'Encrypted vault',

    searchPlaceholder: 'Search secrets, categories, tags or notes',
    searchLabel: 'Search secrets',
    clearSearch: 'Clear search',

    allCategories: 'All',
    sidebarLabel: 'Vault sections',
    revealAll: 'Reveal all',
    hideAll: 'Hide all',
    overviewTitle: 'Overview',
    statSecrets: 'Secrets',
    statCategories: 'Categories',
    statLastUpdate: 'Last update',
    never: 'Never',
    categoriesLabel: 'Filter by category',

    newSecret: 'New secret',
    lockVault: 'Lock vault',
    themeToggle: 'Toggle theme',
    language: 'Language',
    totalSecrets: 'secrets',

    copy: 'Copy',
    copied: 'Copied',
    copyAria: 'Copy {name}',
    reveal: 'Reveal',
    hide: 'Hide',
    revealAria: 'Reveal the value of {name}',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    deleteAria: 'Delete {name}',
    listLabel: 'Stored secrets',
    emptyTitle: 'Your vault is empty',
    emptySubtitle: 'Store your first API key or token to get started.',
    addSecret: 'Add secret',
    noResultsTitle: 'No matching secrets',
    noResultsSubtitle: 'No entry matches your search or the selected category.',
    loadingVault: 'Unlocking vault',
    resultsCount: '{count} secrets shown',

    modalNewTitle: 'New secret',
    modalEditTitle: 'Edit secret',
    closeSheet: 'Close',
    fieldTitle: 'Name',
    fieldNamePlaceholder: 'Anthropic, GitHub, OpenAI…',
    fieldSecret: 'Secret value',
    fieldSecretPlaceholder: 'Paste the token here',
    fieldSecretUnchanged: 'Unchanged',
    fieldSecretKeepHint: 'Leave empty to keep the current value',
    fieldCategory: 'Category',
    fieldCategoryPlaceholder: 'AI',
    fieldTags: 'Tags',
    fieldTagsPlaceholder: 'production, api, personal',
    fieldNotes: 'Notes',
    fieldNotesPlaceholder: 'Expires 2027, read-only scope',
    generateToken: 'Generate',
    save: 'Save',
    saving: 'Saving',
    cancel: 'Cancel',

    confirmDeleteTitle: 'Delete secret',
    confirmDeleteMessage: 'This permanently removes the encrypted entry. This cannot be undone.',

    setupTitle: 'Set up your vault',
    setupSubtitle: 'Choose a master password to encrypt your secrets.',
    setupButton: 'Create vault',
    masterPasswordLabel: 'Master password',
    confirmPasswordLabel: 'Confirm master password',
    masterPasswordPlaceholder: 'At least 8 characters',
    passwordPlaceholder: 'Enter your master password',

    loginTitle: 'Vault locked',
    loginSubtitle: 'Enter your master password to continue.',
    loginButton: 'Unlock',

    fieldRequired: 'This field is required.',
    passwordMismatch: 'Passwords do not match.',
    passwordTooShort: 'The master password must be at least 8 characters.',
    invalidPassword: 'Incorrect master password.',
    rateLimited: 'Too many failed attempts. Try again in 15 minutes.',
    connectionError: 'Connection error.',
    setupFailed: 'Could not create the vault.',
    saveFailed: 'Could not save the secret.',
    loading: 'Loading',
  },

  fr: {
    appName: 'KeyStash',
    vault: 'Coffre chiffré',

    searchPlaceholder: 'Rechercher un secret, une catégorie, un tag',
    searchLabel: 'Rechercher un secret',
    clearSearch: 'Effacer la recherche',

    allCategories: 'Tous',
    sidebarLabel: 'Sections du coffre',
    revealAll: 'Tout afficher',
    hideAll: 'Tout masquer',
    overviewTitle: 'Vue d’ensemble',
    statSecrets: 'Secrets',
    statCategories: 'Catégories',
    statLastUpdate: 'Dernière modif.',
    never: 'Jamais',
    categoriesLabel: 'Filtrer par catégorie',

    newSecret: 'Nouveau secret',
    lockVault: 'Verrouiller',
    themeToggle: 'Changer de thème',
    language: 'Langue',
    totalSecrets: 'secrets',

    copy: 'Copier',
    copied: 'Copié',
    copyAria: 'Copier {name}',
    reveal: 'Afficher',
    hide: 'Masquer',
    revealAria: 'Afficher la valeur de {name}',
    actions: 'Actions',
    edit: 'Modifier',
    delete: 'Supprimer',
    deleteAria: 'Supprimer {name}',
    listLabel: 'Secrets enregistrés',
    emptyTitle: 'Votre coffre est vide',
    emptySubtitle: 'Enregistrez votre première clé API pour commencer.',
    addSecret: 'Ajouter un secret',
    noResultsTitle: 'Aucun secret correspondant',
    noResultsSubtitle: 'Aucune entrée ne correspond à votre recherche ou à la catégorie choisie.',
    loadingVault: 'Déverrouillage du coffre',
    resultsCount: '{count} secrets affichés',

    modalNewTitle: 'Nouveau secret',
    modalEditTitle: 'Modifier le secret',
    closeSheet: 'Fermer',
    fieldTitle: 'Nom',
    fieldNamePlaceholder: 'Anthropic, GitHub, OpenAI…',
    fieldSecret: 'Valeur du secret',
    fieldSecretPlaceholder: 'Collez le token ici',
    fieldSecretUnchanged: 'Inchangée',
    fieldSecretKeepHint: 'Laissez vide pour conserver la valeur actuelle',
    fieldCategory: 'Catégorie',
    fieldCategoryPlaceholder: 'IA',
    fieldTags: 'Tags',
    fieldTagsPlaceholder: 'production, api, personnel',
    fieldNotes: 'Notes',
    fieldNotesPlaceholder: 'Expire en 2027, lecture seule',
    generateToken: 'Générer',
    save: 'Enregistrer',
    saving: 'Enregistrement',
    cancel: 'Annuler',

    confirmDeleteTitle: 'Supprimer le secret',
    confirmDeleteMessage: 'Cette entrée chiffrée est définitivement supprimée. Action irréversible.',

    setupTitle: 'Configurer le coffre',
    setupSubtitle: 'Choisissez un mot de passe maître pour chiffrer vos secrets.',
    setupButton: 'Créer le coffre',
    masterPasswordLabel: 'Mot de passe maître',
    confirmPasswordLabel: 'Confirmer le mot de passe maître',
    masterPasswordPlaceholder: '8 caractères minimum',
    passwordPlaceholder: 'Saisissez votre mot de passe maître',

    loginTitle: 'Coffre verrouillé',
    loginSubtitle: 'Saisissez votre mot de passe maître pour continuer.',
    loginButton: 'Déverrouiller',

    fieldRequired: 'Ce champ est obligatoire.',
    passwordMismatch: 'Les mots de passe ne correspondent pas.',
    passwordTooShort: 'Le mot de passe maître doit comporter au moins 8 caractères.',
    invalidPassword: 'Mot de passe maître incorrect.',
    rateLimited: 'Trop de tentatives échouées. Réessayez dans 15 minutes.',
    connectionError: 'Erreur de connexion.',
    setupFailed: 'Impossible de créer le coffre.',
    saveFailed: "Impossible d'enregistrer le secret.",
    loading: 'Chargement',
  },

  es: {
    appName: 'KeyStash',
    vault: 'Cofre cifrado',

    searchPlaceholder: 'Buscar un secreto, categoría o etiqueta',
    searchLabel: 'Buscar un secreto',
    clearSearch: 'Borrar la búsqueda',

    allCategories: 'Todos',
    sidebarLabel: 'Secciones del cofre',
    revealAll: 'Mostrar todo',
    hideAll: 'Ocultar todo',
    overviewTitle: 'Resumen',
    statSecrets: 'Secretos',
    statCategories: 'Categorías',
    statLastUpdate: 'Última edición',
    never: 'Nunca',
    categoriesLabel: 'Filtrar por categoría',

    newSecret: 'Nuevo secreto',
    lockVault: 'Bloquear',
    themeToggle: 'Cambiar tema',
    language: 'Idioma',
    totalSecrets: 'secretos',

    copy: 'Copiar',
    copied: 'Copiado',
    copyAria: 'Copiar {name}',
    reveal: 'Mostrar',
    hide: 'Ocultar',
    revealAria: 'Mostrar el valor de {name}',
    actions: 'Acciones',
    edit: 'Editar',
    delete: 'Eliminar',
    deleteAria: 'Eliminar {name}',
    listLabel: 'Secretos guardados',
    emptyTitle: 'Su cofre está vacío',
    emptySubtitle: 'Guarde su primera clave API para comenzar.',
    addSecret: 'Agregar secreto',
    noResultsTitle: 'Ningún secreto coincide',
    noResultsSubtitle: 'Ninguna entrada coincide con su búsqueda o la categoría elegida.',
    loadingVault: 'Desbloqueando el cofre',
    resultsCount: '{count} secretos mostrados',

    modalNewTitle: 'Nuevo secreto',
    modalEditTitle: 'Editar secreto',
    closeSheet: 'Cerrar',
    fieldTitle: 'Nombre',
    fieldNamePlaceholder: 'Anthropic, GitHub, OpenAI…',
    fieldSecret: 'Valor del secreto',
    fieldSecretPlaceholder: 'Pegue el token aquí',
    fieldSecretUnchanged: 'Sin cambios',
    fieldSecretKeepHint: 'Déjelo vacío para conservar el valor actual',
    fieldCategory: 'Categoría',
    fieldCategoryPlaceholder: 'IA',
    fieldTags: 'Etiquetas',
    fieldTagsPlaceholder: 'produccion, api, personal',
    fieldNotes: 'Notas',
    fieldNotesPlaceholder: 'Caduca en 2027, solo lectura',
    generateToken: 'Generar',
    save: 'Guardar',
    saving: 'Guardando',
    cancel: 'Cancelar',

    confirmDeleteTitle: 'Eliminar secreto',
    confirmDeleteMessage: 'Esta entrada cifrada se elimina de forma permanente. No se puede deshacer.',

    setupTitle: 'Configure su cofre',
    setupSubtitle: 'Elija una contraseña maestra para cifrar sus secretos.',
    setupButton: 'Crear cofre',
    masterPasswordLabel: 'Contraseña maestra',
    confirmPasswordLabel: 'Confirmar contraseña maestra',
    masterPasswordPlaceholder: 'Mínimo 8 caracteres',
    passwordPlaceholder: 'Introduzca su contraseña maestra',

    loginTitle: 'Cofre bloqueado',
    loginSubtitle: 'Introduzca su contraseña maestra para continuar.',
    loginButton: 'Desbloquear',

    fieldRequired: 'Este campo es obligatorio.',
    passwordMismatch: 'Las contraseñas no coinciden.',
    passwordTooShort: 'La contraseña maestra debe tener al menos 8 caracteres.',
    invalidPassword: 'Contraseña maestra incorrecta.',
    rateLimited: 'Demasiados intentos fallidos. Inténtelo en 15 minutos.',
    connectionError: 'Error de conexión.',
    setupFailed: 'No se pudo crear el cofre.',
    saveFailed: 'No se pudo guardar el secreto.',
    loading: 'Cargando',
  },

  de: {
    appName: 'KeyStash',
    vault: 'Verschlüsselter Tresor',

    searchPlaceholder: 'Secret, Kategorie oder Tag suchen',
    searchLabel: 'Secret suchen',
    clearSearch: 'Suche löschen',

    allCategories: 'Alle',
    sidebarLabel: 'Tresor-Bereiche',
    revealAll: 'Alle anzeigen',
    hideAll: 'Alle verbergen',
    overviewTitle: 'Übersicht',
    statSecrets: 'Secrets',
    statCategories: 'Kategorien',
    statLastUpdate: 'Zuletzt geändert',
    never: 'Nie',
    categoriesLabel: 'Nach Kategorie filtern',

    newSecret: 'Neues Secret',
    lockVault: 'Sperren',
    themeToggle: 'Design wechseln',
    language: 'Sprache',
    totalSecrets: 'Secrets',

    copy: 'Kopieren',
    copied: 'Kopiert',
    copyAria: '{name} kopieren',
    reveal: 'Anzeigen',
    hide: 'Verbergen',
    revealAria: 'Wert von {name} anzeigen',
    actions: 'Aktionen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    deleteAria: '{name} löschen',
    listLabel: 'Gespeicherte Secrets',
    emptyTitle: 'Ihr Tresor ist leer',
    emptySubtitle: 'Speichern Sie Ihren ersten API-Schlüssel, um zu beginnen.',
    addSecret: 'Secret hinzufügen',
    noResultsTitle: 'Keine passenden Secrets',
    noResultsSubtitle: 'Kein Eintrag passt zu Ihrer Suche oder der gewählten Kategorie.',
    loadingVault: 'Tresor wird entsperrt',
    resultsCount: '{count} Secrets angezeigt',

    modalNewTitle: 'Neues Secret',
    modalEditTitle: 'Secret bearbeiten',
    closeSheet: 'Schließen',
    fieldTitle: 'Name',
    fieldNamePlaceholder: 'Anthropic, GitHub, OpenAI…',
    fieldSecret: 'Secret-Wert',
    fieldSecretPlaceholder: 'Token hier einfügen',
    fieldSecretUnchanged: 'Unverändert',
    fieldSecretKeepHint: 'Leer lassen, um den aktuellen Wert zu behalten',
    fieldCategory: 'Kategorie',
    fieldCategoryPlaceholder: 'KI',
    fieldTags: 'Tags',
    fieldTagsPlaceholder: 'produktion, api, privat',
    fieldNotes: 'Notizen',
    fieldNotesPlaceholder: 'Läuft 2027 ab, nur lesen',
    generateToken: 'Generieren',
    save: 'Speichern',
    saving: 'Speichert',
    cancel: 'Abbrechen',

    confirmDeleteTitle: 'Secret löschen',
    confirmDeleteMessage: 'Dieser verschlüsselte Eintrag wird endgültig entfernt. Das kann nicht rückgängig gemacht werden.',

    setupTitle: 'Tresor einrichten',
    setupSubtitle: 'Wählen Sie ein Master-Passwort, um Ihre Secrets zu verschlüsseln.',
    setupButton: 'Tresor erstellen',
    masterPasswordLabel: 'Master-Passwort',
    confirmPasswordLabel: 'Master-Passwort bestätigen',
    masterPasswordPlaceholder: 'Mindestens 8 Zeichen',
    passwordPlaceholder: 'Master-Passwort eingeben',

    loginTitle: 'Tresor gesperrt',
    loginSubtitle: 'Geben Sie Ihr Master-Passwort ein, um fortzufahren.',
    loginButton: 'Entsperren',

    fieldRequired: 'Dieses Feld ist erforderlich.',
    passwordMismatch: 'Die Passwörter stimmen nicht überein.',
    passwordTooShort: 'Das Master-Passwort muss mindestens 8 Zeichen lang sein.',
    invalidPassword: 'Falsches Master-Passwort.',
    rateLimited: 'Zu viele fehlgeschlagene Versuche. In 15 Minuten erneut versuchen.',
    connectionError: 'Verbindungsfehler.',
    setupFailed: 'Der Tresor konnte nicht erstellt werden.',
    saveFailed: 'Das Secret konnte nicht gespeichert werden.',
    loading: 'Lädt',
  },
};

/** Replaces {token} placeholders in a translated string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
