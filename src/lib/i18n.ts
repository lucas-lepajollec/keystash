export type Locale = 'en' | 'fr' | 'es' | 'de';

export interface Translations {
  appName: string;
  tagline: string;
  searchPlaceholder: string;
  newSecret: string;
  allCategories: string;
  noSecretsFound: string;
  noSecretsHint: string;
  copy: string;
  copied: string;
  reveal: string;
  hide: string;
  edit: string;
  delete: string;
  confirmDeleteTitle: string;
  confirmDeleteMessage: string;
  cancel: string;
  save: string;
  saving: string;
  modalNewTitle: string;
  modalEditTitle: string;
  fieldTitle: string;
  fieldNamePlaceholder: string;
  fieldSecret: string;
  fieldSecretPlaceholder: string;
  fieldCategory: string;
  fieldCategoryPlaceholder: string;
  fieldTags: string;
  fieldTagsPlaceholder: string;
  fieldNotes: string;
  fieldNotesPlaceholder: string;
  generateToken: string;
  lockVault: string;
  setupTitle: string;
  setupSubtitle: string;
  loginTitle: string;
  loginSubtitle: string;
  masterPasswordLabel: string;
  confirmPasswordLabel: string;
  masterPasswordPlaceholder: string;
  setupButton: string;
  loginButton: string;
  passwordMismatch: string;
  passwordTooShort: string;
  invalidPassword: string;
  rateLimited: string;
  vaultLocked: string;
  shortcutsHint: string;
  themeToggle: string;
  language: string;
  totalSecrets: string;
}

export const translations: Record<Locale, Translations> = {
  en: {
    appName: 'KeyStash',
    tagline: 'Minimalist secret & token vault',
    searchPlaceholder: 'Search secrets, categories, tags, or notes… ( / or Ctrl+K )',
    newSecret: 'New secret',
    allCategories: 'All',
    noSecretsFound: 'No secrets found',
    noSecretsHint: 'Press "N" or click "+ New secret" to store your first token.',
    copy: 'Copy',
    copied: 'Copied!',
    reveal: 'Reveal',
    hide: 'Hide',
    edit: 'Edit',
    delete: 'Delete',
    confirmDeleteTitle: 'Delete secret',
    confirmDeleteMessage: 'Are you sure you want to delete this secret? This action cannot be undone.',
    cancel: 'Cancel',
    save: 'Save secret',
    saving: 'Saving…',
    modalNewTitle: 'Create new secret',
    modalEditTitle: 'Edit secret',
    fieldTitle: 'Name / Service',
    fieldNamePlaceholder: 'e.g. Anthropic, GitHub, OpenAI, Cloudflare',
    fieldSecret: 'Secret value / Token',
    fieldSecretPlaceholder: 'Paste your secret token here',
    fieldCategory: 'Category',
    fieldCategoryPlaceholder: 'e.g. AI, Development, Infrastructure',
    fieldTags: 'Tags (comma separated)',
    fieldTagsPlaceholder: 'e.g. production, api, personal',
    fieldNotes: 'Notes (optional)',
    fieldNotesPlaceholder: 'e.g. Expires in 2027, read-only scope',
    generateToken: 'Generate random key',
    lockVault: 'Lock vault',
    setupTitle: 'Welcome to KeyStash',
    setupSubtitle: 'Set your master password to initialize your encrypted vault.',
    loginTitle: 'KeyStash Vault Locked',
    loginSubtitle: 'Enter your master password to unlock your secrets.',
    masterPasswordLabel: 'Master password',
    confirmPasswordLabel: 'Confirm master password',
    masterPasswordPlaceholder: '••••••••••••••••',
    setupButton: 'Initialize Vault',
    loginButton: 'Unlock Vault',
    passwordMismatch: 'Passwords do not match.',
    passwordTooShort: 'Master password must be at least 8 characters.',
    invalidPassword: 'Incorrect master password.',
    rateLimited: 'Too many failed login attempts. Please wait 15 minutes before trying again.',
    vaultLocked: 'Vault locked. Please authenticate.',
    shortcutsHint: 'Keyboard: / to search • N to create • Esc to close • Arrow keys to select • Enter to copy',
    themeToggle: 'Toggle theme',
    language: 'Language',
    totalSecrets: 'secrets stored',
  },
  fr: {
    appName: 'KeyStash',
    tagline: 'Coffre minimaliste de clés et tokens',
    searchPlaceholder: 'Rechercher des clés, catégories, tags ou notes… ( / ou Ctrl+K )',
    newSecret: 'Nouveau secret',
    allCategories: 'Tous',
    noSecretsFound: 'Aucun secret trouvé',
    noSecretsHint: 'Appuyez sur "N" ou cliquez sur "+ Nouveau secret" pour enregistrer votre premier token.',
    copy: 'Copier',
    copied: 'Copié !',
    reveal: 'Afficher',
    hide: 'Masquer',
    edit: 'Modifier',
    delete: 'Supprimer',
    confirmDeleteTitle: 'Supprimer le secret',
    confirmDeleteMessage: 'Voulez-vous vraiment supprimer ce secret ? Cette action est irréversible.',
    cancel: 'Annuler',
    save: 'Enregistrer',
    saving: 'Enregistrement…',
    modalNewTitle: 'Créer un secret',
    modalEditTitle: 'Modifier le secret',
    fieldTitle: 'Nom / Service',
    fieldNamePlaceholder: 'ex. Anthropic, GitHub, OpenAI, Cloudflare',
    fieldSecret: 'Valeur secrète / Token',
    fieldSecretPlaceholder: 'Collez votre token secret ici',
    fieldCategory: 'Catégorie',
    fieldCategoryPlaceholder: 'ex. IA, Développement, Infrastructure',
    fieldTags: 'Tags (séparés par des virgules)',
    fieldTagsPlaceholder: 'ex. production, api, personnel',
    fieldNotes: 'Notes (facultatif)',
    fieldNotesPlaceholder: 'ex. Expire en 2027, scope lecture seule',
    generateToken: 'Générer un token',
    lockVault: 'Verrouiller',
    setupTitle: 'Bienvenue sur KeyStash',
    setupSubtitle: 'Définissez votre mot de passe maître pour initialiser votre coffre chiffré.',
    loginTitle: 'Coffre KeyStash verrouillé',
    loginSubtitle: 'Entrez votre mot de passe maître pour déverrouiller vos secrets.',
    masterPasswordLabel: 'Mot de passe maître',
    confirmPasswordLabel: 'Confirmer le mot de passe maître',
    masterPasswordPlaceholder: '••••••••••••••••',
    setupButton: 'Initialiser le coffre',
    loginButton: 'Déverrouiller le coffre',
    passwordMismatch: 'Les mots de passe ne correspondent pas.',
    passwordTooShort: 'Le mot de passe maître doit comporter au moins 8 caractères.',
    invalidPassword: 'Mot de passe maître incorrect.',
    rateLimited: 'Trop de tentatives échouées. Veuillez patienter 15 minutes.',
    vaultLocked: 'Coffre verrouillé. Veuillez vous authentifier.',
    shortcutsHint: 'Clavier : / pour chercher • N pour créer • Échap pour fermer • Flèches pour naviguer • Entrée pour copier',
    themeToggle: 'Changer de thème',
    language: 'Langue',
    totalSecrets: 'secrets enregistrés',
  },
  es: {
    appName: 'KeyStash',
    tagline: 'Cofre minimalista de claves y tokens',
    searchPlaceholder: 'Buscar secretos, categorías, etiquetas o notas… ( / o Ctrl+K )',
    newSecret: 'Nuevo secreto',
    allCategories: 'Todos',
    noSecretsFound: 'No se encontraron secretos',
    noSecretsHint: 'Presione "N" o haga clic en "+ Nuevo secreto" para guardar su primer token.',
    copy: 'Copiar',
    copied: '¡Copiado!',
    reveal: 'Mostrar',
    hide: 'Ocultar',
    edit: 'Editar',
    delete: 'Eliminar',
    confirmDeleteTitle: 'Eliminar secreto',
    confirmDeleteMessage: '¿Está seguro de que desea eliminar este secreto? Esta acción es irreversible.',
    cancel: 'Cancelar',
    save: 'Guardar secreto',
    saving: 'Guardando…',
    modalNewTitle: 'Crear nuevo secreto',
    modalEditTitle: 'Editar secreto',
    fieldTitle: 'Nombre / Servicio',
    fieldNamePlaceholder: 'ej. Anthropic, GitHub, OpenAI, Cloudflare',
    fieldSecret: 'Valor secreto / Token',
    fieldSecretPlaceholder: 'Pegue su token secreto aquí',
    fieldCategory: 'Categoría',
    fieldCategoryPlaceholder: 'ej. IA, Desarrollo, Infraestructura',
    fieldTags: 'Etiquetas (separadas por comas)',
    fieldTagsPlaceholder: 'ej. producción, api, personal',
    fieldNotes: 'Notas (opcional)',
    fieldNotesPlaceholder: 'ej. Expira en 2027, alcance de solo lectura',
    generateToken: 'Generar token aleatorio',
    lockVault: 'Bloquear cofre',
    setupTitle: 'Bienvenido a KeyStash',
    setupSubtitle: 'Defina su contraseña maestra para inicializar su cofre cifrado.',
    loginTitle: 'Cofre KeyStash bloqueado',
    loginSubtitle: 'Ingrese su contraseña maestra para desbloquear sus secretos.',
    masterPasswordLabel: 'Contraseña maestra',
    confirmPasswordLabel: 'Confirmar contraseña maestra',
    masterPasswordPlaceholder: '••••••••••••••••',
    setupButton: 'Inicializar cofre',
    loginButton: 'Desbloquear cofre',
    passwordMismatch: 'Las contraseñas no coinciden.',
    passwordTooShort: 'La contraseña maestra debe tener al menos 8 caracteres.',
    invalidPassword: 'Contraseña maestra incorrecta.',
    rateLimited: 'Demasiados intentos fallidos. Espere 15 minutos.',
    vaultLocked: 'Cofre bloqueado. Por favor autentíquese.',
    shortcutsHint: 'Teclado: / para buscar • N para crear • Esc para cerrar • Flechas para navegar • Enter para copiar',
    themeToggle: 'Cambiar tema',
    language: 'Idioma',
    totalSecrets: 'secretos guardados',
  },
  de: {
    appName: 'KeyStash',
    tagline: 'Minimalistischer Tresor für Secrets und Token',
    searchPlaceholder: 'Secrets, Kategorien, Tags oder Notizen durchsuchen… ( / oder Ctrl+K )',
    newSecret: 'Neues Secret',
    allCategories: 'Alle',
    noSecretsFound: 'Keine Secrets gefunden',
    noSecretsHint: 'Drücken Sie „N“ oder klicken Sie auf „+ Neues Secret“, um Ihr erstes Token zu speichern.',
    copy: 'Kopieren',
    copied: 'Kopiert!',
    reveal: 'Anzeigen',
    hide: 'Verbergen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    confirmDeleteTitle: 'Secret löschen',
    confirmDeleteMessage: 'Möchten Sie dieses Secret wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    cancel: 'Abbrechen',
    save: 'Secret speichern',
    saving: 'Speichern…',
    modalNewTitle: 'Neues Secret erstellen',
    modalEditTitle: 'Secret bearbeiten',
    fieldTitle: 'Name / Dienst',
    fieldNamePlaceholder: 'z.B. Anthropic, GitHub, OpenAI, Cloudflare',
    fieldSecret: 'Geheimwert / Token',
    fieldSecretPlaceholder: 'Fügen Sie Ihr geheimes Token hier ein',
    fieldCategory: 'Kategorie',
    fieldCategoryPlaceholder: 'z.B. KI, Entwicklung, Infrastruktur',
    fieldTags: 'Tags (durch Komma getrennt)',
    fieldTagsPlaceholder: 'z.B. Produktion, API, Persönlich',
    fieldNotes: 'Notizen (optional)',
    fieldNotesPlaceholder: 'z.B. Läuft 2027 ab, Nur-Lese-Rechte',
    generateToken: 'Zufälliges Token generieren',
    lockVault: 'Tresor sperren',
    setupTitle: 'Willkommen bei KeyStash',
    setupSubtitle: 'Legen Sie Ihr Master-Passwort fest, um Ihren verschlüsselten Tresor zu initialisieren.',
    loginTitle: 'KeyStash Tresor gesperrt',
    loginSubtitle: 'Geben Sie Ihr Master-Passwort ein, um Ihre Secrets zu entsperren.',
    masterPasswordLabel: 'Master-Passwort',
    confirmPasswordLabel: 'Master-Passwort bestätigen',
    masterPasswordPlaceholder: '••••••••••••••••',
    setupButton: 'Tresor initialisieren',
    loginButton: 'Tresor entsperren',
    passwordMismatch: 'Die Passwörter stimmen nicht überein.',
    passwordTooShort: 'Das Master-Passwort muss mindestens 8 Zeichen lang sein.',
    invalidPassword: 'Falsches Master-Passwort.',
    rateLimited: 'Zu viele fehlgeschlagene Versuche. Bitte warten Sie 15 Minuten.',
    vaultLocked: 'Tresor gesperrt. Bitte authentifizieren Sie sich.',
    shortcutsHint: 'Tastatur: / zum Suchen • N zum Erstellen • Esc zum Schließen • Pfeiltasten zum Auswählen • Enter zum Kopieren',
    themeToggle: 'Design wechseln',
    language: 'Sprache',
    totalSecrets: 'gespeicherte Secrets',
  },
};
