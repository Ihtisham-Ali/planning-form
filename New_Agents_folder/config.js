// Configuration Management
// This file handles loading and saving configuration from localStorage

const CONFIG_KEY = 'planningAssessmentConfig';

// Default configuration
// Default configuration - Hardcoded as per requirements
const defaultConfig = {
    loqateApiKey: 'BN48-GJ69-ND74-HD67',
    webhookUrl: 'https://hook.eu2.make.com/26ipx0vjxmwszestocfy3hd5lf93816i',
    supabaseUrl: 'https://avoprvquffcinheydnfc.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2b3BydnF1ZmZjaW5oZXlkbmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNjMwNDUsImV4cCI6MjA4NTkzOTA0NX0.A4a5ni4N2n78piQACOfXe6I_w06CUqcwF0IEjreSUl8',
    supabaseBucket: 'site_plans',
    supabaseTable: 'submissions',
    lastUpdated: new Date().toISOString()
};

// Load configuration - Always returns hardcoded values
function loadConfig() {
    return { ...defaultConfig };
}

// Save configuration to localStorage
function saveConfig(config) {
    try {
        config.lastUpdated = new Date().toISOString();
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
        return true;
    } catch (error) {
        console.error('Error saving config:', error);
        return false;
    }
}

// Get current configuration
function getConfig() {
    return loadConfig();
}

// Update specific config value
function updateConfig(key, value) {
    const config = loadConfig();
    config[key] = value;
    return saveConfig(config);
}

// Validate configuration
function validateConfig(config) {
    const errors = [];

    if (!config.loqateApiKey || config.loqateApiKey.trim() === '') {
        errors.push('Loqate API Key is required');
    }

    if (!config.webhookUrl || config.webhookUrl.trim() === '') {
        errors.push('Webhook URL is required');
    } else {
        try {
            new URL(config.webhookUrl);
        } catch {
            errors.push('Webhook URL must be a valid URL');
        }
    }

    return errors;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadConfig, saveConfig, getConfig, updateConfig, validateConfig };
}
