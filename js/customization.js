/**
 * Customization.js - Handles customization for Angry Parents: Christmas Edition
 * This file manages the customization form for uploading photos and setting messages
 */

class GameCustomization {
    constructor() {
        // Maximum file size (2MB)
        this.MAX_FILE_SIZE = 2 * 1024 * 1024;
        
        // Maximum number of photos and messages
        this.MAX_PHOTOS = 10;
        this.MAX_MESSAGES = 15;
        
        // Form elements
        this.photoUploadInput = document.getElementById('photoUpload');
        this.photoPreviewDiv = document.getElementById('photoPreview');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.addMessageBtn = document.getElementById('addMessageBtn');
        this.gnomePhotoSelector = document.getElementById('gnomePhotoSelector');
        this.customizeForm = document.getElementById('photoMessageForm');
        this.cancelCustomizeBtn = document.getElementById('cancelCustomizeBtn');
        
        // Photo storage
        this.uploadedPhotos = [];
        this.selectedGnomeIndex = 0;
        
        // Initialize form
        this.init();
    }
    
    /**
     * Initialize the customization form
     */
    init() {
        // Load any saved data
        this.loadSavedCustomizations();
        
        // Add event listeners
        this.photoUploadInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
        this.addMessageBtn.addEventListener('click', () => this.addNewMessageInput());
        this.customizeForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.cancelCustomizeBtn.addEventListener('click', () => this.hideForm());
        
        // Add initial message input if none exist
        if (this.messagesContainer.children.length === 0) {
            this.addNewMessageInput();
        }
    }
    
    /**
     * Load saved customizations from localStorage
     */
    loadSavedCustomizations() {
        // Load photos
        const savedPhotos = gameStorage.loadCharacters();
        this.uploadedPhotos = savedPhotos;
        
        // Display saved photos
        this.updatePhotoPreview();
        
        // Load messages
        const savedMessages = gameStorage.loadMessages();
        this.displaySavedMessages(savedMessages);
        
        // Load gnome character selection
        this.selectedGnomeIndex = gameStorage.loadGnomeCharacter();
    }
    
    /**
     * Display saved messages in the form
     * @param {Array} messages - Array of message strings
     */
    displaySavedMessages(messages) {
        // Clear existing messages
        this.messagesContainer.innerHTML = '';
        
        // If no saved messages, add one empty input
        if (!messages || messages.length === 0) {
            this.addNewMessageInput();
            return;
        }
        
        // Add each saved message
        messages.forEach(message => {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group mb-2';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control funny-message';
            input.maxLength = 50;
            input.value = message;
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn btn-outline-danger remove-message';
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', () => {
                inputGroup.remove();
                this.updateMessageCount();
            });
            
            inputGroup.appendChild(input);
            inputGroup.appendChild(removeBtn);
            this.messagesContainer.appendChild(inputGroup);
        });
        
        // Update add message button state
        this.updateMessageCount();
    }
    
    /**
     * Handle photo upload
     * @param {Event} event - Input change event
     */    handlePhotoUpload(event) {
        const files = event.target.files;
        
        if (!files || files.length === 0) {
            return;
        }
        
        // Check if uploading too many photos
        if (this.uploadedPhotos.length + files.length > this.MAX_PHOTOS) {
            alert(`You can only upload up to ${this.MAX_PHOTOS} photos. Please select fewer files.`);
            return;
        }
        
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'in-game-loading';
        loadingDiv.innerHTML = `
            <div class="loading-content">
                <p>Processing photos...</p>
                <div class="progress">
                    <div id="photoProcessingProgress" class="progress-bar progress-bar-striped progress-bar-animated" 
                         role="progressbar" style="width: 0%"></div>
                </div>
            </div>
        `;
        document.getElementById('gameContainer').appendChild(loadingDiv);
        
        // Track processed files for progress
        let processedCount = 0;
        const totalFiles = files.length;
        
        // Process each file
        Array.from(files).forEach(file => {
            // Check file type
            if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
                alert('Only JPEG and PNG images are allowed.');
                processedCount++;
                updatePhotoProcessingProgress(processedCount, totalFiles);
                return;
            }
            
            // Check file size
            if (file.size > this.MAX_FILE_SIZE) {
                alert(`File ${file.name} is too large. Maximum size is 2MB.`);
                processedCount++;
                updatePhotoProcessingProgress(processedCount, totalFiles);
                return;
            }
            
            // Read and store the file
            const reader = new FileReader();
            reader.onload = (e) => {
                this.resizeImage(e.target.result, 800, 800).then(resizedDataUrl => {
                    this.uploadedPhotos.push({
                        name: file.name,
                        dataUrl: resizedDataUrl
                    });
                    
                    // Update progress
                    processedCount++;
                    updatePhotoProcessingProgress(processedCount, totalFiles);
                    
                    // If all files processed, update UI
                    if (processedCount === totalFiles) {
                        // Update the preview and gnome selector
                        this.updatePhotoPreview();
                    }
                }).catch(error => {
                    console.error('Error resizing image:', error);
                    alert('Failed to process the uploaded image. Please try again.');
                    
                    // Update progress even on error
                    processedCount++;
                    updatePhotoProcessingProgress(processedCount, totalFiles);
                });
            };
            reader.readAsDataURL(file);
        });
        
        // Reset the file input to allow selecting the same files again
        event.target.value = '';
        
        // Function to update progress bar
        const updatePhotoProcessingProgress = (current, total) => {
            const progress = Math.round((current / total) * 100);
            const progressBar = document.getElementById('photoProcessingProgress');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
                progressBar.setAttribute('aria-valuenow', progress);
            }
            
            // If all done, remove the loading div after a short delay
            if (current >= total) {
                setTimeout(() => {
                    if (document.getElementById('gameContainer').contains(loadingDiv)) {
                        document.getElementById('gameContainer').removeChild(loadingDiv);
                    }
                }, 500);
            }
        };
    }
    
    /**
     * Update the photo preview with uploaded photos
     */
    updatePhotoPreview() {
        // Clear existing preview
        this.photoPreviewDiv.innerHTML = '';
        this.gnomePhotoSelector.innerHTML = '';
        
        // Add each photo to the preview
        this.uploadedPhotos.forEach((photo, index) => {
            // Create preview thumbnail
            const thumbnail = document.createElement('div');
            thumbnail.className = 'photo-thumbnail';
            
            const img = document.createElement('img');
            img.src = photo.dataUrl;
            img.alt = `Photo ${index + 1}`;
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn btn-sm btn-danger remove-photo';
            removeBtn.innerHTML = '&times;';
            removeBtn.addEventListener('click', () => {
                this.removePhoto(index);
            });
            
            thumbnail.appendChild(img);
            thumbnail.appendChild(removeBtn);
            this.photoPreviewDiv.appendChild(thumbnail);
            
            // Create gnome selection option
            const gnomeOption = document.createElement('div');
            gnomeOption.className = 'gnome-photo-option';
            if (index === this.selectedGnomeIndex) {
                gnomeOption.classList.add('selected');
            }
            
            const gnomeImg = document.createElement('img');
            gnomeImg.src = photo.dataUrl;
            gnomeImg.alt = `Gnome Option ${index + 1}`;
            
            gnomeOption.appendChild(gnomeImg);
            gnomeOption.addEventListener('click', () => {
                this.selectGnomePhoto(index);
            });
            
            this.gnomePhotoSelector.appendChild(gnomeOption);
        });
        
        // Update the upload button state
        this.photoUploadInput.disabled = this.uploadedPhotos.length >= this.MAX_PHOTOS;
    }
    
    /**
     * Remove a photo at the specified index
     * @param {number} index - Index of the photo to remove
     */
    removePhoto(index) {
        // Remove the photo
        this.uploadedPhotos.splice(index, 1);
        
        // Update the selected gnome index if needed
        if (this.selectedGnomeIndex >= this.uploadedPhotos.length) {
            this.selectedGnomeIndex = Math.max(0, this.uploadedPhotos.length - 1);
        }
        
        // Update the preview
        this.updatePhotoPreview();
    }
    
    /**
     * Select a photo for the gnome character
     * @param {number} index - Index of the photo to use for the gnome
     */
    selectGnomePhoto(index) {
        this.selectedGnomeIndex = index;
        
        // Update selection in the UI
        const options = this.gnomePhotoSelector.querySelectorAll('.gnome-photo-option');
        options.forEach((option, i) => {
            if (i === index) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }
    
    /**
     * Add a new message input to the form
     */
    addNewMessageInput() {
        const currentCount = this.messagesContainer.querySelectorAll('.funny-message').length;
        
        // Check if we've reached the maximum
        if (currentCount >= this.MAX_MESSAGES) {
            alert(`You can only add up to ${this.MAX_MESSAGES} messages.`);
            return;
        }
        
        // Create a new input group
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group mb-2';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control funny-message';
        input.maxLength = 50;
        input.placeholder = 'Enter a funny message';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-outline-danger remove-message';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
            inputGroup.remove();
            this.updateMessageCount();
        });
        
        inputGroup.appendChild(input);
        inputGroup.appendChild(removeBtn);
        this.messagesContainer.appendChild(inputGroup);
        
        // Focus the new input
        input.focus();
        
        // Update add message button state
        this.updateMessageCount();
    }
    
    /**
     * Update the message count and button state
     */
    updateMessageCount() {
        const currentCount = this.messagesContainer.querySelectorAll('.funny-message').length;
        this.addMessageBtn.disabled = currentCount >= this.MAX_MESSAGES;
    }
    
    /**
     * Handle the form submission
     * @param {Event} event - Form submit event
     */
    handleFormSubmit(event) {
        event.preventDefault();
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        // Get all message values
        const messageInputs = this.messagesContainer.querySelectorAll('.funny-message');
        const messages = Array.from(messageInputs)
            .map(input => input.value.trim())
            .filter(message => message.length > 0);
        
        // Save data
        gameStorage.saveCharacters(this.uploadedPhotos);
        gameStorage.saveMessages(messages);
        gameStorage.saveGnomeCharacter(this.selectedGnomeIndex);
        
        // Hide the form
        this.hideForm();
        
        // Show confirmation
        alert('Your customizations have been saved successfully!');
    }
    
    /**
     * Validate the form before submission
     * @returns {boolean} Whether the form is valid
     */
    validateForm() {
        // Check if photos are uploaded
        if (this.uploadedPhotos.length === 0) {
            alert('Please upload at least one photo.');
            return false;
        }
        
        // Check if at least one message is entered
        const messageInputs = this.messagesContainer.querySelectorAll('.funny-message');
        const hasValidMessage = Array.from(messageInputs).some(input => input.value.trim().length > 0);
        
        if (!hasValidMessage) {
            alert('Please enter at least one funny message.');
            return false;
        }
        
        return true;
    }
    
    /**
     * Hide the customization form
     */
    hideForm() {
        document.getElementById('customizeForm').classList.add('d-none');
    }
    
    /**
     * Resize an image to specified dimensions
     * @param {string} dataUrl - Image data URL
     * @param {number} maxWidth - Maximum width for the image
     * @param {number} maxHeight - Maximum height for the image
     * @returns {Promise<string>} Resized image data URL
     */
    resizeImage(dataUrl, maxWidth, maxHeight) {
        return new Promise((resolve, reject) => {
            try {
                const img = new Image();
                img.onload = () => {
                    // Calculate new dimensions while maintaining aspect ratio
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }
                    
                    // Create a canvas to draw the resized image
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw the image on the canvas
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Get the resized image as data URL
                    const resizedDataUrl = canvas.toDataURL(
                        img.src.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
                        0.85 // Quality setting for JPEG
                    );
                    
                    resolve(resizedDataUrl);
                };
                
                img.onerror = () => {
                    reject(new Error('Failed to load image for resizing'));
                };
                
                img.src = dataUrl;
            } catch (error) {
                reject(error);
            }
        });
    }
}

// Initialize the customization manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameCustomization = new GameCustomization();
});
