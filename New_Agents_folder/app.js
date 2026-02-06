// Planning Assessment Form - Main Application
// Handles form validation, Loqate Address API, file uploads, and webhook submission

// ===========================
// Application State
// ===========================

let appState = {
    config: null,
    supabase: null,
    uploadedFiles: [],
    correspondenceAddressData: null,
    selectedLPA: null,
    isSubmitting: false,
    googlePlacesService: null, // Left null as we removed Google Maps
    sessionToken: null
};

// Draft saving to localStorage
const DRAFT_KEY = 'planningAssessmentDraft';

// ===========================
// Initialization
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Load configuration
    appState.config = getConfig();

    // Initialize Supabase
    if (appState.config.supabaseUrl && appState.config.supabaseKey) {
        appState.supabase = supabase.createClient(appState.config.supabaseUrl, appState.config.supabaseKey);
    }

    // Initialize form handlers
    initializeForm();
    initializeFileUpload();
    initializeLPADropdown();
    initializeCharacterCounter();
    initializeAddressAutocomplete();

    // Load draft if available
    loadDraft();

    // Auto-save draft periodically
    setInterval(saveDraft, 30000); // Every 30 seconds
});


// ===========================
// Form Initialization
// ===========================

function initializeForm() {
    const form = document.getElementById('assessmentForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        await submitForm();
    });

    // Real-time validation on blur
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            // Skip if hidden
            if (input.offsetParent === null) return;

            if (input.value.trim()) {
                validateField(input);
            }
        });

        // Clear error on input
        input.addEventListener('input', () => {
            clearFieldError(input);
        });
    });

    // Site Address Prefix Logic
    const prefixSelect = document.getElementById('siteAddressPrefix');
    const valueContainer = document.getElementById('siteAddressValueContainer');
    const valueLabel = document.getElementById('siteAddressValueLabel');
    const valueInput = document.getElementById('siteAddressValue');

    if (prefixSelect) {
        prefixSelect.addEventListener('change', () => {
            const val = prefixSelect.value;
            valueInput.value = ''; // Clear when changing
            clearFieldError(valueInput);

            if (val === 'Number') {
                valueContainer.style.display = 'block';
                valueLabel.textContent = 'Add site number';
                valueInput.setAttribute('required', 'true');
                valueInput.placeholder = "e.g. 123";
            } else if (val === 'Name') {
                valueContainer.style.display = 'block';
                valueLabel.textContent = 'Add name';
                valueInput.setAttribute('required', 'true');
                valueInput.placeholder = "e.g. Oak Cottage";
            } else {
                valueContainer.style.display = 'none';
                valueInput.removeAttribute('required');
            }
        });
    }
}

// ===========================
// Form Validation
// ===========================

function validateForm() {
    let isValid = true;

    // Clear all previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    // Validate all required fields
    // Validate all required fields
    const fields = [
        { id: 'firstName', name: 'First Name', validator: validateRequired },
        { id: 'lastName', name: 'Last Name', validator: validateRequired },
        { id: 'email', name: 'Email', validator: validateEmail },
        { id: 'phoneNumber', name: 'Phone Number', validator: validatePhone },
        { id: 'whatsappUser', name: 'WhatsApp User', validator: validateRequired },
        { id: 'correspondenceAddress', name: 'Correspondence Address', validator: validateCorrespondenceAddress },
        // Manual Site Address Fields
        { id: 'siteAddressPrefix', name: 'Site Address Prefix', validator: validateRequired },
        { id: 'siteAddressRoad', name: 'Site Address Road', validator: validateRequired },
        { id: 'siteAddressTown', name: 'Site Address Town', validator: validateRequired },
        { id: 'siteAddressPostcode', name: 'Site Address Postcode', validator: validateRequired },
        // Conditional will be handled by generic required check if visible
        { id: 'siteAddressValue', name: 'Site Value', validator: validateConditionalSiteValue },

        { id: 'lpaSearch', name: 'Local Planning Authority', validator: validateLPA },
        { id: 'fileUpload', name: 'Site Plan / Documents', validator: validateFiles },
        { id: 'proposalSummary', name: 'Proposal Summary', validator: validateRequired },
        { id: 'heardAboutUs', name: 'How did you hear about us', validator: validateRequired }
    ];

    fields.forEach(field => {
        const element = document.getElementById(field.id);
        // Only validate if element exists and is visible (offsetParent is a good check for visibility)
        if (element && element.offsetParent !== null) {
            const error = field.validator(element, field.name);

            if (error) {
                showFieldError(element, error);
                isValid = false;
            }
        }
    });

    // Check honeypot
    if (document.getElementById('honeypot').value) {
        isValid = false;
    }

    return isValid;
}

function validateField(element) {
    clearFieldError(element);

    if (element.offsetParent === null) return true; // Skip hidden

    const validators = {
        'firstName': () => validateRequired(element, 'First Name'),
        'lastName': () => validateRequired(element, 'Last Name'),
        'email': () => validateEmail(element, 'Email'),
        'phoneNumber': () => validatePhone(element, 'Phone Number'),
        'whatsappUser': () => validateRequired(element, 'WhatsApp User'),
        'correspondenceAddress': () => validateCorrespondenceAddress(element, 'Correspondence Address'),
        'siteAddressPrefix': () => validateRequired(element, 'Site Address Prefix'),
        'siteAddressValue': () => validateConditionalSiteValue(element),
        'siteAddressRoad': () => validateRequired(element, 'Site Address Road'),
        'siteAddressTown': () => validateRequired(element, 'Site Address Town'),
        'siteAddressCounty': () => validateRequired(element, 'Site Address County'),
        'siteAddressPostcode': () => validateRequired(element, 'Site Address Postcode'),
        'lpaSearch': () => validateLPA(element, 'Local Planning Authority'),
        'proposalSummary': () => validateRequired(element, 'Proposal Summary'),
        'heardAboutUs': () => validateRequired(element, 'How did you hear about us')
    };

    const validator = validators[element.id];
    if (validator) {
        const error = validator();
        if (error) {
            showFieldError(element, error);
            return false;
        }
    }

    return true;
}

// Validator functions
function validateRequired(element, fieldName) {
    const value = element.value.trim();
    if (!value) {
        return `${fieldName} is required`;
    }
    return null;
}

function validateEmail(element, fieldName) {
    const value = element.value.trim();
    if (!value) {
        return `${fieldName} is required`;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
    }

    return null;
}

function validatePhone(element, fieldName) {
    const value = element.value.trim();
    if (!value) {
        return `${fieldName} is required`;
    }

    // Basic phone validation (digits, spaces, dashes, parentheses)
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(value)) {
        return 'Please enter a valid phone number';
    }

    // Check minimum length (at least 10 digits)
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
        return 'Phone number must be at least 10 digits';
    }

    return null;
}

function validateCorrespondenceAddress(element, fieldName) {
    if (!appState.correspondenceAddressData) {
        return 'Please select an address from the suggestions';
    }

    if (!appState.correspondenceAddressData.postcode) {
        return 'Correspondence address must include a valid UK postcode';
    }

    if (appState.correspondenceAddressData.country !== 'United Kingdom') {
        return 'Only UK addresses are allowed';
    }

    return null;
}


function validateConditionalSiteValue(element) {
    if (element.offsetParent === null) return null; // Hidden
    return validateRequired(element, 'This field');
}

function validateLPA(element, fieldName) {
    if (!appState.selectedLPA) {
        return 'Please select a Local Planning Authority';
    }
    return null;
}

function validateFiles(element, fieldName) {
    if (appState.uploadedFiles.length === 0) {
        return 'Please upload at least one file';
    }
    return null;
}

function showFieldError(element, message) {
    element.classList.add('error');
    const errorElement = element.closest('.form-group').querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearFieldError(element) {
    element.classList.remove('error');
    const errorElement = element.closest('.form-group').querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// ===========================
// Address Autocomplete (Loqate/PCW)
// ===========================

function initializeAddressAutocomplete() {
    const correspondenceInput = document.getElementById('correspondenceAddress');

    if (correspondenceInput) {
        setupAddressInput(correspondenceInput, 'correspondence');
    }
}

function setupAddressInput(input, type) {
    const dropdown = document.getElementById(`${type}AddressSuggestions`);
    let debounceTimer;
    let selectedIndex = -1;

    input.addEventListener('input', (e) => {
        const query = e.target.value;

        clearTimeout(debounceTimer);

        if (query.length < 3) {
            dropdown.classList.remove('active');
            return;
        }

        debounceTimer = setTimeout(() => {
            fetchAddressPredictions(query, dropdown, type);
        }, 300);
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.address-dropdown-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items, selectedIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items, selectedIndex);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            items[selectedIndex].click();
        } else if (e.key === 'Escape') {
            dropdown.classList.remove('active');
            selectedIndex = -1;
        }
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
            selectedIndex = -1;
        }
    });
}

function fetchAddressPredictions(query, dropdown, type, containerId = '') {
    if (!appState.config.loqateApiKey) {
        showAddressError(dropdown, 'Loqate API key not configured. Please check Settings.');
        return;
    }

    // Show loading
    dropdown.innerHTML = '<div class="address-loading">Searching addresses...</div>';
    dropdown.classList.add('active');

    // Loqate Find API
    let url = `https://api.addressy.com/Capture/Interactive/Find/v1.10/json3.ws?Key=${encodeURIComponent(appState.config.loqateApiKey)}&Countries=GB`;

    // If containerId is present, we search within that container
    if (containerId) {
        url += `&Container=${encodeURIComponent(containerId)}`;
    } else {
        url += `&Text=${encodeURIComponent(query)}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Items && data.Items.length > 0) {
                // Check if the first item is an error
                if (data.Items[0].Error) {
                    console.error('Loqate API Error:', data.Items[0].Description);
                    showAddressError(dropdown, 'Error searching addresses. Please check your API key.');
                } else {
                    displayAddressPredictions(data.Items, dropdown, type);
                }
            } else {
                if (containerId) {
                    // If defined container has no results, go back? or show error.
                    showAddressError(dropdown, 'No addresses found in this area.');
                } else {
                    showAddressError(dropdown, 'No addresses found. Try a postcode.');
                }
            }
        })
        .catch(error => {
            console.error('Loqate fetch error:', error);
            showAddressError(dropdown, 'Error connecting to address service.');
        });
}

function displayAddressPredictions(items, dropdown, type) {
    dropdown.innerHTML = '';

    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'address-dropdown-item';
        div.setAttribute('role', 'option');

        let displayText = item.Text + (item.Description ? `, ${item.Description}` : '');

        div.innerHTML = `
            <div class="address-primary">${item.Text}</div>
            <div class="address-secondary">${item.Description || ''}</div>
        `;

        div.addEventListener('click', () => {
            // Check item.Type to decide action (Drill-down vs Retrieve)
            // Loqate usage: If it is not a direct "Address", it is likely a container (Postcode, Street, Locality, Building)
            // We drill down by calling Find again with the Container ID.
            if (item.Type !== 'Address') {
                // Drill down into container
                fetchAddressPredictions('', dropdown, type, item.Id);
            } else {
                // Retrieve details
                selectAddress(item.Id, item.Text + ' ' + item.Description, type);
                dropdown.classList.remove('active');
            }
        });
        div.addEventListener('mouseenter', () => {
            dropdown.querySelectorAll('.address-dropdown-item').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
        });

        dropdown.appendChild(div);
    });

    dropdown.classList.add('active');
}

function showAddressError(dropdown, message) {
    dropdown.innerHTML = `<div class="address-loading" style="color: #ef4444;">${message}</div>`;
    dropdown.classList.add('active');
}

function selectAddress(id, description, type) {
    const input = document.getElementById(`${type}Address`);
    // Ideally we wait for the full formatted address from Retrieve before setting value,
    // but setting it here gives immediate feedback.
    input.value = description;

    // Loqate Retrieve API
    const url = `https://api.addressy.com/Capture/Interactive/Retrieve/v1.10/json3.ws?Key=${encodeURIComponent(appState.config.loqateApiKey)}&Id=${encodeURIComponent(id)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Items && data.Items.length > 0) {
                if (data.Items[0].Error) {
                    console.error('Retrieve Error:', data.Items[0].Description);
                } else {
                    processPlaceDetails(data.Items[0], type);
                }
            }
        })
        .catch(error => console.error('Loqate Retrieve Error:', error));
}

function processPlaceDetails(place, type) {
    // Loqate returns the address with newlines in the 'Label' field.
    // We replace these with ", " to ensure it displays correctly in the single-line input field.
    const cleanLabel = place.Label.replace(/[\r\n]+/g, ', ').trim();

    // Loqate structure mapping
    const addressData = {
        formatted: cleanLabel, // Fully formatted address (single line)
        postcode: place.PostalCode,
        city: place.City,
        county: place.ProvinceName || place.Province,
        country: 'United Kingdom',
        lat: 0,
        lng: 0
    };

    if (place.Latitude) addressData.lat = parseFloat(place.Latitude);
    if (place.Longitude) addressData.lng = parseFloat(place.Longitude);

    // Validate Country
    if (place.CountryIso !== 'GB' && place.CountryName !== 'United Kingdom') {
        addressData.country = place.CountryName || 'United Kingdom';
    }

    // Store address data
    if (type === 'correspondence') {
        appState.correspondenceAddressData = addressData;
    } else {
        appState.siteAddressData = addressData;
    }

    // Update input with clean formatted address from the API
    const input = document.getElementById(`${type}Address`);
    if (input) {
        input.value = cleanLabel;
        // Trigger blur to validate
        input.dispatchEvent(new Event('blur'));
    }

    console.log(`${type} address selected:`, addressData);
}

function updateSelection(items, index) {
    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

// ===========================
// LPA Dropdown
// ===========================

function initializeLPADropdown() {
    const input = document.getElementById('lpaSearch');
    const dropdown = document.getElementById('lpaSuggestions');
    let selectedIndex = -1;

    input.addEventListener('input', (e) => {
        const query = e.target.value;
        selectedIndex = -1; // Reset selection index on new input

        if (query.length < 2) {
            dropdown.classList.remove('active');
            appState.selectedLPA = null;
            document.getElementById('lpaName').value = '';
            document.getElementById('lpaId').value = '';
            return;
        }

        // Clear existing selection when typing starts
        appState.selectedLPA = null;
        document.getElementById('lpaName').value = '';
        document.getElementById('lpaId').value = '';

        const results = searchLPAs(query);
        displayLPAResults(results, dropdown);
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.lpa-dropdown-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items, selectedIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items, selectedIndex);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            items[selectedIndex].click();
        } else if (e.key === 'Escape') {
            dropdown.classList.remove('active');
            selectedIndex = -1;
        }
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
            selectedIndex = -1;
        }
    });
}

function displayLPAResults(results, dropdown) {
    dropdown.innerHTML = '';

    if (results.length === 0) {
        dropdown.innerHTML = '<div class="lpa-no-results">No planning authorities found</div>';
        dropdown.classList.add('active');
        return;
    }

    results.forEach((lpa, index) => {
        const item = document.createElement('div');
        item.className = 'lpa-dropdown-item';
        item.setAttribute('role', 'option');
        item.textContent = `${lpa.name} (${lpa.region})`;

        item.addEventListener('click', () => {
            selectLPA(lpa);
            dropdown.classList.remove('active');
        });

        item.addEventListener('mouseenter', () => {
            dropdown.querySelectorAll('.lpa-dropdown-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
        });

        dropdown.appendChild(item);
    });

    dropdown.classList.add('active');
}

function selectLPA(lpa) {
    appState.selectedLPA = lpa;
    const fullName = `${lpa.name} (${lpa.region})`;
    document.getElementById('lpaSearch').value = fullName;
    document.getElementById('lpaName').value = fullName;
    document.getElementById('lpaId').value = lpa.id;

    // Trigger validation on selection
    const lpaInput = document.getElementById('lpaSearch');
    if (lpaInput) {
        lpaInput.classList.remove('error');
        const errorElement = lpaInput.closest('.form-group').querySelector('.error-message');
        if (errorElement) errorElement.textContent = '';
    }

    console.log('LPA selected:', lpa);
}

// ===========================
// File Upload
// ===========================

function initializeFileUpload() {
    const fileInput = document.getElementById('fileUpload');
    const fileLabel = document.querySelector('.file-upload-label');
    const uploadedFilesContainer = document.getElementById('uploadedFiles');

    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    fileLabel.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileLabel.classList.add('drag-over');
    });

    fileLabel.addEventListener('dragleave', () => {
        fileLabel.classList.remove('drag-over');
    });

    fileLabel.addEventListener('drop', (e) => {
        e.preventDefault();
        fileLabel.classList.remove('drag-over');

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
}

function handleFiles(files) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/vnd.dwg',
        'application/dwg',
        'application/acad'
    ];

    files.forEach(file => {
        // Validate file size
        if (file.size > maxSize) {
            alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
            return;
        }

        // Validate file type
        if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.dwg')) {
            alert(`File "${file.name}" is not a supported format.`);
            return;
        }

        // Add to uploaded files
        appState.uploadedFiles.push(file);
    });

    displayUploadedFiles();
}

function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    container.innerHTML = '';

    appState.uploadedFiles.forEach((file, index) => {
        const fileElement = document.createElement('div');
        fileElement.className = 'uploaded-file';
        fileElement.innerHTML = `
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <button type="button" class="file-remove" data-index="${index}" aria-label="Remove ${file.name}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        const removeBtn = fileElement.querySelector('.file-remove');
        removeBtn.addEventListener('click', () => removeFile(index));

        container.appendChild(fileElement);
    });
}

function removeFile(index) {
    appState.uploadedFiles.splice(index, 1);
    displayUploadedFiles();

    // Reset file input
    document.getElementById('fileUpload').value = '';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ===========================
// Character Counter
// ===========================

function initializeCharacterCounter() {
    const textarea = document.getElementById('proposalSummary');
    const counter = document.getElementById('charCounter');

    textarea.addEventListener('input', () => {
        const length = textarea.value.length;
        const maxLength = 2000;

        counter.textContent = `${length} / ${maxLength}`;

        if (length > maxLength * 0.9) {
            counter.classList.add('warning');
        } else {
            counter.classList.remove('warning');
        }

        if (length >= maxLength) {
            counter.classList.add('error');
        } else {
            counter.classList.remove('error');
        }
    });
}

// ===========================
// Form Submission
// ===========================

async function submitForm() {
    if (appState.isSubmitting) {
        return;
    }

    appState.isSubmitting = true;

    const submitButton = document.getElementById('submitButton');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoader = submitButton.querySelector('.button-loader');

    // Update button state
    submitButton.disabled = true;
    buttonText.style.display = 'none';
    buttonLoader.style.display = 'flex';

    try {
        // Upload files first
        const uploadedFileUrls = await uploadFiles();

        // Prepare payload
        const payload = {
            first_name: document.getElementById('firstName').value.trim(),
            last_name: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone_country_code: document.getElementById('phoneCountry').value,
            phone_number: document.getElementById('phoneNumber').value.trim(),
            whatsapp_user: document.getElementById('whatsappUser').value,
            company_name: document.getElementById('companyName').value.trim(),
            correspondence_address: {
                formatted: appState.correspondenceAddressData.formatted,
                postcode: appState.correspondenceAddressData.postcode,
                city: appState.correspondenceAddressData.city,
                county: appState.correspondenceAddressData.county,
                country: appState.correspondenceAddressData.country,
                lat: appState.correspondenceAddressData.lat,
                lng: appState.correspondenceAddressData.lng
            },
            site_address: {
                prefix: document.getElementById('siteAddressPrefix').value,
                value: document.getElementById('siteAddressValue').value.trim(), // Number or Name
                road: document.getElementById('siteAddressRoad').value.trim(),
                town: document.getElementById('siteAddressTown').value.trim(),
                county: document.getElementById('siteAddressCounty').value.trim(),
                postcode: document.getElementById('siteAddressPostcode').value.trim()
            },
            lpa_name: `${appState.selectedLPA.name} (${appState.selectedLPA.region})`,
            lpa_id: appState.selectedLPA.id,
            proposal_summary: document.getElementById('proposalSummary').value.trim(),
            heard_about_us: document.getElementById('heardAboutUs').value,
            uploaded_files: uploadedFileUrls,
            submitted_at: new Date().toISOString()
        };

        // Store in Supabase
        await saveToSupabase(payload);

        // Send to webhook
        await sendToWebhook(payload);

        // Show success screen
        showSuccessScreen();

        // Clear draft
        clearDraft();

    } catch (error) {
        console.error('Submission error:', error);
        showSubmissionError(error.message);
    } finally {
        appState.isSubmitting = false;
        submitButton.disabled = false;
        buttonText.style.display = 'inline';
        buttonLoader.style.display = 'none';
    }
}

async function uploadFiles() {
    if (!appState.supabase) {
        throw new Error('Supabase not initialized');
    }

    const bucketName = appState.config.supabaseBucket;
    const uploadedFilesData = [];

    for (const file of appState.uploadedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await appState.supabase.storage
            .from(bucketName)
            .upload(filePath, file);

        if (error) {
            console.error(`Error uploading ${file.name}:`, error);
            throw new Error(`Failed to upload ${file.name}: ${error.message}`);
        }

        // Get Public URL
        const { data: { publicUrl } } = appState.supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        uploadedFilesData.push({
            name: file.name,
            url: publicUrl,
            type: file.type,
            size: file.size
        });
    }

    return uploadedFilesData;
}

async function saveToSupabase(payload) {
    if (!appState.supabase) return;

    const tableName = appState.config.supabaseTable;

    // Flatten payload for Supabase if necessary, or store as JSON
    // Given the structure, we can store nested objects as JSON if the table column is JSONB
    // For simplicity, let's assume the table has columns for these or we store the whole thing

    const { error } = await appState.supabase
        .from(tableName)
        .insert([payload]);

    if (error) {
        console.error('Error saving to Supabase:', error);
        // We don't necessarily want to block the whole process if DB save fails but storage/webhook might work
        // However, user said "like to store all data and attachments in supabase", so we should probably error.
        throw new Error(`Database save failed: ${error.message}`);
    }
}

async function sendToWebhook(payload) {
    const webhookUrl = appState.config.webhookUrl;

    if (!webhookUrl) {
        throw new Error('Webhook URL not configured');
    }

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.statusText}`);
    }

    return response;
}

function showSuccessScreen() {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('successScreen').style.display = 'flex';
}

function showSubmissionError(message) {
    const errorBanner = document.createElement('div');
    errorBanner.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        max-width: 90%;
        text-align: center;
    `;
    errorBanner.textContent = `❌ Submission failed: ${message}. Please try again.`;
    document.body.appendChild(errorBanner);

    setTimeout(() => {
        errorBanner.remove();
    }, 5000);
}

// ===========================
// Success Screen
// ===========================

document.getElementById('submitAnotherButton')?.addEventListener('click', () => {
    // Reset form
    document.getElementById('assessmentForm').reset();
    appState.uploadedFiles = [];
    appState.correspondenceAddressData = null;
    appState.siteAddressData = null;
    appState.selectedLPA = null;
    displayUploadedFiles();

    // Hide success screen
    document.getElementById('successScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===========================
// Draft Management
// ===========================

function saveDraft() {
    const draft = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phoneCountry: document.getElementById('phoneCountry').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        whatsappUser: document.getElementById('whatsappUser').value,
        companyName: document.getElementById('companyName').value,
        correspondenceAddress: document.getElementById('correspondenceAddress').value,
        // Manual Site Address Fields
        siteAddressPrefix: document.getElementById('siteAddressPrefix').value,
        siteAddressValue: document.getElementById('siteAddressValue').value,
        siteAddressRoad: document.getElementById('siteAddressRoad').value,
        siteAddressTown: document.getElementById('siteAddressTown').value,
        siteAddressCounty: document.getElementById('siteAddressCounty').value,
        siteAddressPostcode: document.getElementById('siteAddressPostcode').value,
        lpaSearch: document.getElementById('lpaSearch').value,
        proposalSummary: document.getElementById('proposalSummary').value,
        heardAboutUs: document.getElementById('heardAboutUs').value,
        timestamp: new Date().toISOString()
    };

    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (error) {
        console.error('Error saving draft:', error);
    }
}

function loadDraft() {
    try {
        const stored = localStorage.getItem(DRAFT_KEY);
        if (!stored) return;

        const draft = JSON.parse(stored);

        // Don't load drafts older than 7 days
        const draftAge = Date.now() - new Date(draft.timestamp).getTime();
        if (draftAge > 7 * 24 * 60 * 60 * 1000) {
            clearDraft();
            return;
        }

        // Restore form values
        document.getElementById('firstName').value = draft.firstName || '';
        document.getElementById('lastName').value = draft.lastName || '';
        document.getElementById('email').value = draft.email || '';
        document.getElementById('phoneCountry').value = draft.phoneCountry || '+44';
        document.getElementById('phoneNumber').value = draft.phoneNumber || '';
        document.getElementById('whatsappUser').value = draft.whatsappUser || '';
        document.getElementById('companyName').value = draft.companyName || '';
        document.getElementById('correspondenceAddress').value = draft.correspondenceAddress || '';

        // Manual Site Address Fields
        if (document.getElementById('siteAddressPrefix')) {
            document.getElementById('siteAddressPrefix').value = draft.siteAddressPrefix || '';
            // Trigger change to show/hide value field
            document.getElementById('siteAddressPrefix').dispatchEvent(new Event('change'));
        }
        if (document.getElementById('siteAddressValue')) {
            document.getElementById('siteAddressValue').value = draft.siteAddressValue || '';
        }
        if (document.getElementById('siteAddressRoad')) {
            document.getElementById('siteAddressRoad').value = draft.siteAddressRoad || '';
        }
        if (document.getElementById('siteAddressTown')) {
            document.getElementById('siteAddressTown').value = draft.siteAddressTown || '';
        }
        if (document.getElementById('siteAddressCounty')) {
            document.getElementById('siteAddressCounty').value = draft.siteAddressCounty || '';
        }
        if (document.getElementById('siteAddressPostcode')) {
            document.getElementById('siteAddressPostcode').value = draft.siteAddressPostcode || '';
        }

        document.getElementById('lpaSearch').value = draft.lpaSearch || '';
        document.getElementById('proposalSummary').value = draft.proposalSummary || '';
        document.getElementById('heardAboutUs').value = draft.heardAboutUs || '';

        // Update character counter
        const event = new Event('input');
        if (document.getElementById('proposalSummary')) {
            document.getElementById('proposalSummary').dispatchEvent(event);
        }

    } catch (error) {
        console.error('Error loading draft:', error);
    }
}

function clearDraft() {
    try {
        localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
        console.error('Error clearing draft:', error);
    }
}
