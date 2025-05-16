// customization.js
// Handles customization form logic, photo/message storage, validation, and preview

const MIN_PHOTOS = 5;
const MAX_PHOTOS = 10;
const MIN_MESSAGES = 10;
const MAX_MESSAGES = 15;
const MAX_PHOTO_SIZE_MB = 2;
const MAX_MESSAGE_LENGTH = 50;

function createMessageInput(index, value = '') {
  return `<input type="text" class="form-control mb-2 message-input" maxlength="${MAX_MESSAGE_LENGTH}" placeholder="Funny message #${index + 1}" value="${value}" required aria-label="Funny message #${index + 1}">`;
}

function updateGnomePhotoDropdown(photoList) {
  const gnomeSelect = document.getElementById('gnome-photo');
  gnomeSelect.innerHTML = '';
  photoList.forEach((photo, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `Photo #${idx + 1}`;
    gnomeSelect.appendChild(opt);
  });
}

function showPhotoPreview(photoList) {
  const preview = document.getElementById('photo-preview');
  preview.innerHTML = '';
  photoList.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    preview.appendChild(img);
  });
}

function validateForm(photos, messages) {
  let valid = true;
  let error = '';
  if (photos.length < MIN_PHOTOS || photos.length > MAX_PHOTOS) {
    error = `Please upload between ${MIN_PHOTOS} and ${MAX_PHOTOS} photos.`;
    valid = false;
  } else if (messages.length < MIN_MESSAGES || messages.length > MAX_MESSAGES) {
    error = `Please enter between ${MIN_MESSAGES} and ${MAX_MESSAGES} messages.`;
    valid = false;
  } else if (messages.some(msg => msg.length > MAX_MESSAGE_LENGTH)) {
    error = `Messages must be under ${MAX_MESSAGE_LENGTH} characters.`;
    valid = false;
  }
  return { valid, error };
}

function handlePhotoUpload(files, callback) {
  const photoList = [];
  let loaded = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
      callback(null, `Invalid file: ${file.name}`);
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      // Crop to circle using canvas
      const img = new window.Image();
      img.onload = function() {
        const size = Math.min(img.width, img.height, 256);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, (img.width-size)/2, (img.height-size)/2, size, size, 0, 0, size, size);
        ctx.restore();
        photoList[i] = canvas.toDataURL('image/png', 0.8);
        loaded++;
        if (loaded === files.length) {
          callback(photoList);
        }
      };
      img.onerror = function() {
        callback(null, `Could not load image: ${file.name}`);
      };
      img.src = e.target.result;
    };
    reader.onerror = function() {
      callback(null, `Could not read file: ${file.name}`);
    };
    reader.readAsDataURL(file);
  }
}

function saveCustomizationData(photos, gnomeIdx, messages) {
  try {
    photos.forEach((src, idx) => {
      localStorage.setItem(`photo_${idx+1}`, src);
    });
    localStorage.setItem('gnome_photo', photos[gnomeIdx]);
    localStorage.setItem('messages', JSON.stringify(messages));
    localStorage.setItem('photo_count', photos.length);
    return true;
  } catch (e) {
    return false;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // If photos/messages already in LocalStorage, skip form and start game
  var photoCount = parseInt(localStorage.getItem('photo_count') || '0', 10);
  var messages = [];
  try { messages = JSON.parse(localStorage.getItem('messages')) || []; } catch(e){}
  if (photoCount >= MIN_PHOTOS && photoCount <= MAX_PHOTOS && messages.length >= MIN_MESSAGES && messages.length <= MAX_MESSAGES) {
    // Data exists, skip form
    document.getElementById('customization-form-container').classList.add('d-none');
    document.getElementById('game-container').classList.remove('d-none');
    var photos = [];
    for (var i = 1; i <= photoCount; i++) {
      var src = localStorage.getItem('photo_' + i);
      if (src) photos.push(src);
    }
    var gnomeIdx = 0;
    var gnomePhoto = localStorage.getItem('gnome_photo');
    if (gnomePhoto) {
      gnomeIdx = photos.indexOf(gnomePhoto);
      if (gnomeIdx < 0) gnomeIdx = 0;
    }
    startGameScene({ photos: photos, gnomeIdx: gnomeIdx, messages: messages });
    return;
  }
  const form = document.getElementById('customization-form');
  const photosInput = document.getElementById('photos');
  const messagesContainer = document.getElementById('messages-container');
  const addMessageBtn = document.getElementById('add-message-btn');
  const gnomeSelect = document.getElementById('gnome-photo');
  const formError = document.getElementById('form-error');
  let photoList = [];
  let messageInputs = [];

  // Initialize message fields
  for (let i = 0; i < MIN_MESSAGES; i++) {
    messagesContainer.insertAdjacentHTML('beforeend', createMessageInput(i));
  }

  addMessageBtn.addEventListener('click', () => {
    const count = messagesContainer.querySelectorAll('.message-input').length;
    if (count < MAX_MESSAGES) {
      messagesContainer.insertAdjacentHTML('beforeend', createMessageInput(count));
    }
  });

  photosInput.addEventListener('change', (e) => {
    handlePhotoUpload(e.target.files, (photos, error) => {
      if (error) {
        formError.textContent = error;
        formError.classList.remove('d-none');
        return;
      }
      photoList = photos;
      showPhotoPreview(photoList);
      updateGnomePhotoDropdown(photoList);
      formError.classList.add('d-none');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const messages = Array.from(messagesContainer.querySelectorAll('.message-input')).map(input => input.value.trim()).filter(Boolean);
    const gnomeIdx = gnomeSelect.selectedIndex;
    const { valid, error } = validateForm(photoList, messages);
    if (!valid) {
      formError.textContent = error;
      formError.classList.remove('d-none');
      return;
    }
    if (!saveCustomizationData(photoList, gnomeIdx, messages)) {
      formError.textContent = 'Error saving data. Please check storage space.';
      formError.classList.remove('d-none');
      return;
    }
    formError.classList.add('d-none');
    // Start game
    startGameScene({ photos: photoList, gnomeIdx, messages });
  });
});
