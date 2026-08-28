// LexiSimplify - Client-side Interactive Logic

document.addEventListener('DOMContentLoaded', function () {
    // 1. Dark Mode / Theme Toggle
    const themeToggleBtn = document.getElementById('themeToggle');
    const body = document.body;

    // Load theme from localStorage or document body
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function () {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            
            // Sync with backend if user is logged in
            fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dark_mode: newTheme === 'dark' ? 1 : 0
                })
            }).catch(err => console.log("Theme sync not completed (guest user or server offline)."));
        });
    }

    function setTheme(theme) {
        body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update toggle icon
        const icon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
        if (icon) {
            if (theme === 'dark') {
                icon.className = 'fa-solid fa-sun text-warning';
            } else {
                icon.className = 'fa-solid fa-moon text-secondary';
            }
        }
    }

    // 2. Initialize Bootstrap Tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // 3. File Upload Module Drag & Drop
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const progressWrapper = document.getElementById('progressWrapper');
    const progressBar = document.getElementById('progressBar');
    const uploadStatus = document.getElementById('uploadStatus');

    if (dropZone && fileInput) {
        // Drag events
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.add('border-primary');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.remove('border-primary');
            }, false);
        });

        // Handle dropped files
        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length) {
                fileInput.files = files;
                updateFilenameLabel(files[0].name);
            }
        });

        // Click zone to trigger file input
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
                updateFilenameLabel(fileInput.files[0].name);
            }
        });
    }

    function updateFilenameLabel(name) {
        const label = document.getElementById('uploadFilename');
        if (label) {
            label.textContent = `Selected: ${name}`;
            label.classList.remove('d-none');
        }
    }

    // 4. Form Submit & Progress Simulation
    if (uploadForm) {
        uploadForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const textInput = document.getElementById('textInput');
            const file = fileInput ? fileInput.files[0] : null;
            const text = textInput ? textInput.value.trim() : "";

            if (!file && !text) {
                alert("Please select a file or enter legal text first.");
                return;
            }

            // Show progress bar
            if (progressWrapper) progressWrapper.classList.remove('d-none');
            
            // Create FormData
            const formData = new FormData();
            if (file) {
                formData.append('file', file);
            }
            if (text) {
                formData.append('text', text);
            }

            // Simulate progress bar movement for visual impact
            let progress = 0;
            const interval = setInterval(() => {
                if (progress < 85) {
                    progress += Math.floor(Math.random() * 10) + 2;
                    updateProgress(progress, "Extracting document details...");
                }
            }, 100);

            // Send actual request
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                clearInterval(interval);
                if (data.success) {
                    updateProgress(100, "Simplifying clauses using NLP...");
                    setTimeout(() => {
                        window.location.href = `/simplify/${data.doc_id}`;
                    }, 500);
                } else {
                    if (progressWrapper) progressWrapper.classList.add('d-none');
                    alert(data.error || "Simplification failed. Please try again.");
                }
            })
            .catch(error => {
                clearInterval(interval);
                if (progressWrapper) progressWrapper.classList.add('d-none');
                console.error("Error during upload:", error);
                alert("An error occurred. Check file size or file type.");
            });
        });
    }

    function updateProgress(value, text) {
        if (progressBar) {
            progressBar.style.width = `${value}%`;
            progressBar.setAttribute('aria-valuenow', value);
            progressBar.textContent = `${value}%`;
        }
        if (uploadStatus) {
            uploadStatus.textContent = text;
        }
    }

    // 5. NLP Toggle options (POS Tag colorization & entity highlights)
    const togglePosBtn = document.getElementById('togglePosBtn');
    if (togglePosBtn) {
        togglePosBtn.addEventListener('click', function() {
            const isWordView = document.getElementById('wordAnalysisPane');
            if (isWordView) {
                isWordView.classList.toggle('highlight-pos-active');
                if (isWordView.classList.contains('highlight-pos-active')) {
                    togglePosBtn.textContent = "Clear POS Highlights";
                    togglePosBtn.classList.replace('btn-outline-primary', 'btn-primary');
                } else {
                    togglePosBtn.textContent = "Highlight Parts of Speech";
                    togglePosBtn.classList.replace('btn-primary', 'btn-outline-primary');
                }
            }
        });
    }

    // Interactive sentence click to map elements
    const origSentences = document.querySelectorAll('.sentence-pair');
    origSentences.forEach(pair => {
        pair.addEventListener('click', function() {
            origSentences.forEach(p => p.classList.remove('bg-light-primary'));
            pair.classList.add('bg-light-primary');
        });
    });
});
