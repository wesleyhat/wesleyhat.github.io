// main.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://acasxnbktmwcckfrvulm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8Bv_VRnpMGlBWaXA3UhNPA_ck3akiaF';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TMDB_API_KEY = "a60b5cafc7b6b2fbc0626df055ae2d62";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

let moviesData = [];
let activeSearch = '';
let activeFilters = { genre: '', tag: '', cast: '' };
let currentSort = { key: 'title', ascending: true };
let userSession = null;


// -------------------------
// Initialize App
// -------------------------
document.addEventListener('DOMContentLoaded', () => {
    createNavBar();
    fetchMovies();
});

function isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function addScanBarcodeButton(btnContainer) {
    const scanBtn = document.createElement('button');
    scanBtn.textContent = "Scan from Barcode";
    scanBtn.className = "modal-btn";

    scanBtn.addEventListener('click', async () => {
        let movieTitle;

        if (isMobile()) {
            // Mobile: use iPhone camera
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment'; // back camera
            input.style.display = 'none';

            input.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const img = new Image();
                img.src = URL.createObjectURL(file);

                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    if (!code) {
                        alert("Barcode not detected. Try again.");
                        return;
                    }

                    movieTitle = await lookupBarcode(code.data);
                    if (!movieTitle) movieTitle = "Unscanable";

                    const titleInput = document.querySelector('#movie-title-input');
                    if (titleInput) titleInput.value = movieTitle;
                };
            });

            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);

        } else {
            // Desktop manual entry
            const barcode = prompt("Enter barcode manually:");
            if (!barcode) return;
            movieTitle = await lookupBarcode(barcode);
            if (!movieTitle) movieTitle = "Unscanable";

            // Use the TMDB search by title flow
            try {
                const tmdbResults = await searchTmdbByTitle(movieTitle);

                if (!tmdbResults.length) {
                    alert("No movies found on TMDB for: " + movieTitle);
                    return;
                }

                // For simplicity, just take the first result to preview
                const detail = await getTmdbDetails(tmdbResults[0].id);

                const movieData = {
                    title: detail.title || "Unknown",
                    desc: detail.overview || "No description available.",
                    rating: extractMpaa(detail) || "NR",
                    release_date: detail.release_date || "",
                    genre: detail.genres ? detail.genres.map(g => g.name).join(', ') : "Unknown",
                    cast: detail.credits ? detail.credits.cast.slice(0, 5).map(c => c.name).join(', ') : "Unknown",
                    cover_img: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : "",
                    tags: "",
                    tmdb_id: detail.id
                };

                showPreviewModal(movieData, document.querySelector('.modal'));
            } catch (err) {
                console.error("TMDB lookup error:", err);
                alert("Failed to fetch movie details from TMDB.");
            }
        }
    });

    btnContainer.appendChild(scanBtn);
}

function cleanTitle(title) {
    if (!title) return "";
    // Remove everything after '(' or '['
    title = title.split(/[\(\[]/)[0].trim();
    // Remove 'VHS' and everything after
    let vhsIndex = title.toUpperCase().indexOf("VHS");
    if (vhsIndex !== -1) {
        title = title.substring(0, vhsIndex).trim();
    }
    // Remove common suffixes
    const suffixes = ["DVD", "Blu-ray"];
    for (let suffix of suffixes) {
        if (title.endsWith(suffix)) {
            title = title.substring(0, title.length - suffix.length).trim();
        }
    }
    console.log("[cleanTitle] Result:", title);
    return title;
}

// Lookup barcode via Supabase Edge Function with auth token
async function lookupBarcode(barcode) {
    try {
        // Get current session and token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error("User not logged in or token not available.");
        }

        console.log("[lookupBarcode] Barcode:", barcode);

        const res = await fetch(
            `https://acasxnbktmwcckfrvulm.supabase.co/functions/v1/barcode-lookup?barcode=${barcode}`,
            {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!res.ok) {
            const text = await res.text();
            console.error(`[lookupBarcode] Failed: ${res.status}`, text);
            return null;
        }

        const movieTitle = await res.text(); // Edge Function returns plain text
        console.log('[lookupBarcode] Movie Title:', movieTitle);
        let cleanName = cleanTitle(movieTitle)
        return cleanName || null;

    } catch (err) {
        console.error('[lookupBarcode] Error:', err);
        return null;
    }
}





// -------------------------
// Navigation Bar
// -------------------------
function createNavBar() {
    const nav = document.createElement('nav');
    nav.id = 'top-nav';

    // Left menu (desktop)
    const leftMenu = document.createElement('div');
    leftMenu.className = 'nav-left';

    const desktopButtons = [
        { text: 'Add Movie', handler: showAddMovieModal },
        { text: 'Search Movie', handler: showSearchModal },
        { text: 'Sort By', handler: showSortModal },
        { text: 'Filters', handler: showFilterModal }
    ];

    desktopButtons.forEach(btnData => {
        const btn = createNavButton(btnData.text, btnData.handler);
        leftMenu.appendChild(btn);
    });

    // Right menu (login/logout)
    const rightMenu = document.createElement('div');
    rightMenu.className = 'nav-right';
    const loginBtn = createNavButton(userSession ? 'Logout' : 'Login', () => {
        if (userSession) handleLogout();
        else showLoginModal();
    });
    loginBtn.id = 'login-btn';
    rightMenu.appendChild(loginBtn);

    // Hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '<span></span><span></span><span></span>';

    // Mobile menu overlay
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    const mobileList = document.createElement('ul');

    // Add mobile buttons with correct event listeners
    desktopButtons.forEach(btnData => {
        const li = document.createElement('li');
        const btn = createNavButton(btnData.text, () => {
            btnData.handler();
            mobileMenu.classList.remove('open'); // close menu after click
        });
        li.appendChild(btn);
        mobileList.appendChild(li);
    });

    // Mobile login button
    const loginLi = document.createElement('li');
    const mobileLoginBtn = createNavButton(userSession ? 'Logout' : 'Login', () => {
        if (userSession) handleLogout();
        else showLoginModal();
        mobileMenu.classList.remove('open');
    });
    loginLi.appendChild(mobileLoginBtn);
    mobileList.appendChild(loginLi);

    mobileMenu.appendChild(mobileList);

    // Hamburger toggle
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });

    nav.append(leftMenu, rightMenu, hamburger);
    document.body.prepend(nav);
    document.body.appendChild(mobileMenu);
}

function createNavButton(text, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.addEventListener('click', onClick);
    btn.className = 'nav-btn';
    return btn;
}


// -------------------------
// Fetch and Render Movies
// -------------------------
async function fetchMovies() {

    if (!userSession) {
        renderMovieCards([]);
        return;
    }

    const { data, error } = await supabase.from('Movies').select('*');
    if (error) return console.error('Error fetching movies:', error);

    moviesData = data;
    applyFiltersAndSort();
}

function applyFiltersAndSort() {
    let filtered = [...moviesData];

    if (activeSearch) {
        const searchLower = activeSearch.toLowerCase();
        filtered = filtered.filter(m => m.title.toLowerCase().includes(searchLower));
    }

    if (activeFilters.genre) filtered = filtered.filter(m => m.genre?.split(',').map(g => g.trim()).includes(activeFilters.genre));
    if (activeFilters.tag) filtered = filtered.filter(m => m.tags?.split(',').map(t => t.trim()).includes(activeFilters.tag));
    if (activeFilters.cast) filtered = filtered.filter(m => m.cast?.split(',').map(c => c.trim()).includes(activeFilters.cast));

    filtered.sort((a,b) => {
        let valA = a[currentSort.key] || '';
        let valB = b[currentSort.key] || '';
        if (currentSort.key === 'release_date') valA = valA || ''; valB = valB || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return currentSort.ascending ? -1 : 1;
        if (valA > valB) return currentSort.ascending ? 1 : -1;
        return 0;
    });

    renderMovieCards(filtered);
}

function renderMovieCards(movies) {
    let container = document.getElementById('movie-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'movie-container';
        container.className = 'container';
        document.body.appendChild(container);
    }
    container.innerHTML = '';

    if (!movies.length) {
        const noMovies = document.createElement('p');
        noMovies.textContent = 'No movies to display.';
        container.appendChild(noMovies);
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = movie.id;

        const img = document.createElement('img');
        img.src = movie.cover_img || '';
        card.appendChild(img);

        const content = document.createElement('div');
        content.className = 'card-content';

        const title = document.createElement('h3');
        title.textContent = movie.title;
        content.appendChild(title);

        const release = document.createElement('p');
        release.textContent = movie.release_date?.substring(0,4) || 'N/A';
        content.appendChild(release);

        card.appendChild(content);
        container.appendChild(card);

        card.addEventListener('click', () => showMovieDetails(movie));
    });
}

// -------------------------
// TMDB helpers
// -------------------------
async function searchTmdbByTitle(title) {
    const res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
    if (!res.ok) throw new Error('TMDB search error');
    const data = await res.json();
    return data.results || [];
}

async function getTmdbDetails(tmdbId) {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,release_dates`);
    if (!res.ok) throw new Error('TMDB details error');
    return res.json();
}

function extractMpaa(detailJson) {
    const releases = detailJson.release_dates?.results || [];
    for (const entry of releases) {
        if (entry.iso_3166_1 === 'US') {
            for (const r of entry.release_dates) {
                if (r.certification) return r.certification;
            }
        }
    }
    return 'NR';
}

// -------------------------
// Modals
// -------------------------
function showSearchModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');

    const content = document.createElement('div');
    content.className = 'modal-content search-modal';
    modal.appendChild(content);

    const header = document.createElement('h2');
    header.textContent = 'Search Movie';
    content.appendChild(header);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter movie title...';
    input.className = 'modal-input';
    content.appendChild(input);

    const btnContainer = document.createElement('div');
    btnContainer.className = 'modal-btn-container';
    content.appendChild(btnContainer);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-cancel';
    cancelBtn.textContent = 'Cancel';
    btnContainer.appendChild(cancelBtn);

    const searchBtn = document.createElement('button');
    searchBtn.className = 'btn-search';
    searchBtn.textContent = 'Search';
    btnContainer.appendChild(searchBtn);

    cancelBtn.addEventListener('click', () => closeModal(modal));
    searchBtn.addEventListener('click', () => {
        activeSearch = input.value.trim();
        applyFiltersAndSort();
        closeModal(modal);
    });

    modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal); });
}

function showSortModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');

    const content = document.createElement('div');
    content.className = 'modal-content sort-modal';
    modal.appendChild(content);

    const header = document.createElement('h2');
    header.textContent = 'Sort Movies';
    content.appendChild(header);

    const sortKeys = ['title', 'release_date', 'rating'];
    sortKeys.forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'modal-btn';
        btn.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        btn.addEventListener('click', () => {
            if (currentSort.key === key) currentSort.ascending = !currentSort.ascending;
            else { currentSort.key = key; currentSort.ascending = true; }
            applyFiltersAndSort();
            closeModal(modal);
        });
        content.appendChild(btn);
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-cancel modal-bottom-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => closeModal(modal));
    content.appendChild(cancelBtn);

    modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal); });
}

function showFilterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');

    const content = document.createElement('div');
    content.className = 'modal-content filter-modal';
    modal.appendChild(content);

    const header = document.createElement('h2');
    header.textContent = 'Filter Movies';
    content.appendChild(header);

    function createDropdown(labelText, key, options) {
        const wrapper = document.createElement('div');
        wrapper.className = 'dropdown-wrapper';
        const label = document.createElement('label');
        label.textContent = labelText + ': ';
        wrapper.appendChild(label);

        const select = document.createElement('select');
        select.className = 'modal-select';

        const emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = 'Any';
        select.appendChild(emptyOpt);

        options.forEach(opt => {
            if (!opt) return;
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            select.appendChild(option);
        });

        select.value = activeFilters[key];
        select.addEventListener('change', () => { activeFilters[key] = select.value; });

        wrapper.appendChild(select);
        return wrapper;
    }

    const allGenres = Array.from(new Set(moviesData.flatMap(m => m.genre?.split(',').map(g => g.trim()) || [])));
    const allTags = Array.from(new Set(moviesData.flatMap(m => m.tags?.split(',').map(t => t.trim()) || [])));
    const allCast = Array.from(new Set(moviesData.flatMap(m => m.cast?.split(',').map(c => c.trim()) || [])));

    content.appendChild(createDropdown('Genre', 'genre', allGenres));
    content.appendChild(createDropdown('Tag', 'tag', allTags));
    content.appendChild(createDropdown('Cast', 'cast', allCast));

    const btnContainer = document.createElement('div');
    btnContainer.className = 'modal-btn-container';
    content.appendChild(btnContainer);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-cancel';
    cancelBtn.textContent = 'Cancel';
    btnContainer.appendChild(cancelBtn);

    const applyBtn = document.createElement('button');
    applyBtn.className = 'btn-apply';
    applyBtn.textContent = 'Apply';
    btnContainer.appendChild(applyBtn);

    cancelBtn.addEventListener('click', () => closeModal(modal));
    applyBtn.addEventListener('click', () => { applyFiltersAndSort(); closeModal(modal); });

    modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal); });
}

function closeModal(modal) {
    modal.remove();
    document.body.classList.remove('no-scroll');
}

// -------------------------
// Movie Modal with Edit
// -------------------------
async function showMovieDetails(movie) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');

    const content = document.createElement('div');
    content.className = 'modal-content';
    modal.appendChild(content);

    // Top row: Poster + Info
    const topRow = document.createElement('div');
    topRow.className = 'modal-top';
    content.appendChild(topRow);

    const poster = document.createElement('img');
    poster.className = 'modal-poster';
    poster.src = movie.cover_img || '';
    topRow.appendChild(poster);

    const info = document.createElement('div');
    info.className = 'modal-info';
    topRow.appendChild(info);

    // ---- Read-only display ----
    function createField(label, value) {
        const wrapper = document.createElement('div');
        wrapper.className = 'field';
        const lbl = document.createElement('strong');
        lbl.textContent = label + ': ';
        const valSpan = document.createElement('span');
        valSpan.textContent = value || 'N/A';
        wrapper.appendChild(lbl);
        wrapper.appendChild(valSpan);
        return wrapper;
    }

    function createTagField(label, values) {
        const wrapper = document.createElement('div');
        wrapper.className = 'field';
        const lbl = document.createElement('strong');
        lbl.textContent = label + ': ';
        wrapper.appendChild(lbl);

        (values?.split(',').map(v => v.trim()) || []).forEach(v => {
            if (!v) return;
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = v;
            wrapper.appendChild(span);
        });

        return wrapper;
    }

    info.append(
        createField('Title', movie.title),
        createField('Release Date', movie.release_date),
        createField('Rating', movie.rating),
        createField('Description', movie.desc),
        createTagField('Genre', movie.genre),
        createTagField('Tags', movie.tags)
    );

    // Cast section
    if (movie.cast) {
        const castSection = document.createElement('div');
        castSection.className = 'modal-section';
        const castHeader = document.createElement('h3');
        castHeader.textContent = 'Cast';
        const castList = document.createElement('p');
        castList.textContent = movie.cast;
        castSection.append(castHeader, castList);
        content.appendChild(castSection);
    }

    // ---- Action buttons ----
    const actionRow = document.createElement('div');
    actionRow.className = 'modal-actions';
    content.appendChild(actionRow);

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-save';
    editBtn.textContent = 'Edit';
    actionRow.appendChild(editBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.display = 'none'; // minimal inline only to hide initially; will be toggled via class below
    actionRow.appendChild(cancelBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete';
    deleteBtn.textContent = 'Delete';
    actionRow.appendChild(deleteBtn);

    // Show buttons row is appended already
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            close();
        }
    });

    function close() {
        modal.remove();
        document.body.classList.remove('no-scroll');
    }

    // ---- Edit mode ----
    editBtn.addEventListener('click', () => {
        const originalMovie = { ...movie };

        // Toggle UI: change Edit -> Save, show cancel
        editBtn.textContent = 'Save';
        cancelBtn.style.display = ''; // show (kept minimal inline for toggle)
        info.innerHTML = ''; // clear current info to render editable fields

        function makeEditableField(label, valKey) {
            const wrapper = document.createElement('div');
            wrapper.className = 'editable-field';
            const lbl = document.createElement('span');
            lbl.textContent = label + ': ';
            lbl.style.fontWeight = 'bold';
            wrapper.appendChild(lbl);

            const span = document.createElement('span');
            span.className = 'readonly';
            span.textContent = movie[valKey] || '';
            wrapper.appendChild(span);

            span.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'modal-input';
                input.value = span.textContent;
                wrapper.replaceChild(input, span);
                input.focus();

                const commit = () => {
                    span.textContent = input.value;
                    wrapper.replaceChild(span, input);
                    movie[valKey] = input.value;
                };

                input.addEventListener('blur', commit);
                input.addEventListener('keydown', e => { if (e.key === 'Enter') commit(); });
            });

            return wrapper;
        }

        const allGenres = Array.from(new Set(moviesData.flatMap(m => m.genre?.split(',').map(g => g.trim()) || [])));
        const allTags = Array.from(new Set(moviesData.flatMap(m => m.tags?.split(',').map(t => t.trim()) || [])));

        function makeMultiSelect(label, options, selectedValues, key) {
            const wrapper = document.createElement('div');
            wrapper.className = 'multi-select';
            const lbl = document.createElement('span');
            lbl.textContent = label + ': ';
            lbl.style.fontWeight = 'bold';
            wrapper.appendChild(lbl);

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'multi-select-options';
            wrapper.appendChild(optionsDiv);

            function renderOptions() {
                optionsDiv.innerHTML = '';
                options.forEach(opt => {
                    if (!opt) return;
                    const btn = document.createElement('button');
                    btn.className = 'multi-option';
                    btn.textContent = opt;
                    if (selectedValues.includes(opt)) btn.classList.add('selected');

                    btn.addEventListener('click', () => {
                        if (selectedValues.includes(opt)) {
                            selectedValues = selectedValues.filter(v => v !== opt);
                            btn.classList.remove('selected');
                        } else {
                            selectedValues.push(opt);
                            btn.classList.add('selected');
                        }
                        movie[key] = selectedValues.join(', ');
                    });

                    optionsDiv.appendChild(btn);
                });

                const addBtn = document.createElement('button');
                addBtn.className = 'multi-option add-new';
                addBtn.textContent = '+ Add New';
                addBtn.addEventListener('click', () => {
                    const newVal = prompt(`Enter new ${label.toLowerCase()}:`);
                    if (newVal && !options.includes(newVal)) {
                        options.push(newVal);
                        selectedValues.push(newVal);
                        renderOptions();
                        movie[key] = selectedValues.join(', ');
                    }
                });

                optionsDiv.appendChild(addBtn);
            }

            renderOptions();
            return wrapper;
        }

        info.append(
            makeEditableField('Title', 'title'),
            makeEditableField('Release Date', 'release_date'),
            makeEditableField('Rating', 'rating'),
            makeEditableField('Description', 'desc'),
            makeMultiSelect('Genre', allGenres, movie.genre?.split(',').map(g => g.trim()) || [], 'genre'),
            makeMultiSelect('Tags', allTags, movie.tags?.split(',').map(t => t.trim()) || [], 'tags')
        );

        // Save handler
        editBtn.onclick = async () => {
            try {
                const payload = {
                    title: movie.title,
                    desc: movie.desc,
                    release_date: movie.release_date,
                    genre: movie.genre,
                    rating: movie.rating,
                    tags: movie.tags,
                    cover_img: movie.cover_img,
                };
                const { error } = await supabase.from('Movies').update(payload).eq('id', movie.id);
                if (error) throw error;
                fetchMovies();
                close();
            } catch (err) {
                alert('Error saving movie: ' + (err.message || err));
            }
        };

        // Cancel edits
        cancelBtn.onclick = () => {
            Object.assign(movie, originalMovie);
            close();
            showMovieDetails(movie);
        };
    });

    // Delete
    deleteBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this movie?')) return;
        try {
            const { error } = await supabase.from('Movies').delete().eq('id', movie.id);
            if (error) throw error;
            fetchMovies();
            close();
        } catch (err) {
            alert('Error deleting movie: ' + (err.message || err));
        }
    });
}

// -------------------------
// Add Movie Modal with multiple TMDB results
// -------------------------
async function showAddMovieModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');

    const content = document.createElement('div');
    content.className = 'modal-content add-modal';
    modal.appendChild(content);

    const header = document.createElement('h2');
    header.textContent = 'Add Movie';
    content.appendChild(header);

    // Input controls
    const controls = document.createElement('div');
    controls.className = 'add-controls';
    content.appendChild(controls);

    const searchType = document.createElement('select');
    searchType.className = 'modal-select';
    const optionTitle = document.createElement('option');
    optionTitle.value = 'title';
    optionTitle.textContent = 'Search by Title';
    const optionId = document.createElement('option');
    optionId.value = 'id';
    optionId.textContent = 'Search by TMDB ID';
    searchType.appendChild(optionTitle);
    searchType.appendChild(optionId);
    controls.appendChild(searchType);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter title or TMDB ID';
    input.className = 'modal-input';
    controls.appendChild(input);

    // Buttons
    const btnContainer = document.createElement('div');
    btnContainer.className = 'modal-btn-container';
    content.appendChild(btnContainer);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-cancel';
    cancelBtn.textContent = 'Cancel';
    btnContainer.appendChild(cancelBtn);

    const searchBtn = document.createElement('button');
    searchBtn.className = 'btn-search';
    searchBtn.textContent = 'Search';
    btnContainer.appendChild(searchBtn);

    addScanBarcodeButton(btnContainer); // add to the button container


    cancelBtn.addEventListener('click', () => {
        modal.remove();
        document.body.classList.remove('no-scroll');
    });

    searchBtn.addEventListener('click', async () => {
        try {
            let tmdbResults = [];
            if (searchType.value === 'title') {
                tmdbResults = await searchTmdbByTitle(input.value);
            } else {
                const detail = await getTmdbDetails(parseInt(input.value));
                tmdbResults = [detail];
            }

            if (!tmdbResults.length) throw new Error('No movies found.');

            // Clear previous results
            const prev = content.querySelector('.results-container');
            if (prev) prev.remove();

            const resultsContainer = document.createElement('div');
            resultsContainer.className = 'results-container';
            content.appendChild(resultsContainer);

            tmdbResults.forEach(result => {
                const card = document.createElement('div');
                card.className = 'result-card';

                if (result.poster_path) {
                    const img = document.createElement('img');
                    img.className = 'result-poster';
                    img.src = `https://image.tmdb.org/t/p/w92${result.poster_path}`;
                    card.appendChild(img);
                }

                const info = document.createElement('div');
                info.className = 'result-info';
                info.innerHTML = `<strong>${result.title}</strong><br>${result.release_date || 'Unknown'}`;
                card.appendChild(info);

                card.addEventListener('click', async () => {
                    const detail = await getTmdbDetails(result.id);
                    const movieData = {
                        title: detail.title || 'Unknown',
                        desc: detail.overview || 'No description available.',
                        rating: extractMpaa(detail) || 'NR',
                        release_date: detail.release_date || '',
                        genre: detail.genres ? detail.genres.map(g => g.name).join(', ') : 'Unknown',
                        cast: detail.credits ? detail.credits.cast.slice(0, 5).map(c => c.name).join(', ') : 'Unknown',
                        cover_img: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : '',
                        tags: '',
                        tmdb_id: detail.id
                    };
                    showPreviewModal(movieData, modal);
                });

                resultsContainer.appendChild(card);
            });

        } catch (err) {
            console.error('TMDB Search Error:', err);
            alert('Failed to fetch movies. Check console.');
        }
    });

    modal.addEventListener('click', e => { if (e.target === modal) { modal.remove(); document.body.classList.remove('no-scroll'); } });
}

// -------------------------
// Preview Modal (mimics movie detail modal)
// -------------------------
function showPreviewModal(movieData, parentModal) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');

    const content = document.createElement('div');
    content.className = 'modal-content preview-modal';
    modal.appendChild(content);

    const header = document.createElement('h2');
    header.textContent = movieData.title;
    content.appendChild(header);

    const topRow = document.createElement('div');
    topRow.className = 'modal-top';
    content.appendChild(topRow);

    if (movieData.cover_img) {
        const img = document.createElement('img');
        img.className = 'modal-poster';
        img.src = movieData.cover_img;
        topRow.appendChild(img);
    }

    const info = document.createElement('div');
    info.className = 'modal-info';
    info.innerHTML = `
        <p><strong>Release Date:</strong> ${movieData.release_date}</p>
        <p><strong>Genre:</strong> ${movieData.genre}</p>
        <p><strong>Rating:</strong> ${movieData.rating}</p>
        <p><strong>Cast:</strong> ${movieData.cast}</p>
        <p><strong>Description:</strong> ${movieData.desc}</p>
    `;
    topRow.appendChild(info);

    const btnContainer = document.createElement('div');
    btnContainer.className = 'modal-actions';
    content.appendChild(btnContainer);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-cancel';
    cancelBtn.textContent = 'Cancel';
    btnContainer.appendChild(cancelBtn);

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add';
    addBtn.textContent = 'Add';
    btnContainer.appendChild(addBtn);

    cancelBtn.addEventListener('click', () => {
        modal.remove();
        document.body.classList.remove('no-scroll');
    });

    addBtn.addEventListener('click', async () => {
        try {
            const { error } = await supabase.from('Movies').insert([movieData]);
            if (error) throw error;

            modal.remove();
            if (parentModal) parentModal.remove();
            document.body.classList.remove('no-scroll');
            alert('Movie added successfully!');
            fetchMovies();
        } catch (err) {
            console.error('Error adding movie:', err);
            alert('Failed to add movie. Check console.');
        }
    });

    modal.addEventListener('click', e => { if (e.target === modal) { modal.remove(); document.body.classList.remove('no-scroll'); } });
}

function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');

    const content = document.createElement('div');
    content.className = 'modal-content login-modal';
    modal.appendChild(content);

    const header = document.createElement('h2');
    header.textContent = 'Login';
    content.appendChild(header);

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'Email';
    emailInput.className = 'modal-input';
    content.appendChild(emailInput);

    const pwInput = document.createElement('input');
    pwInput.type = 'password';
    pwInput.placeholder = 'Password';
    pwInput.className = 'modal-input';
    content.appendChild(pwInput);

    const btnContainer = document.createElement('div');
    btnContainer.className = 'modal-btn-container';
    content.appendChild(btnContainer);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-cancel';
    cancelBtn.textContent = 'Cancel';
    btnContainer.appendChild(cancelBtn);

    const loginBtn = document.createElement('button');
    loginBtn.className = 'btn-search';
    loginBtn.textContent = 'Login';
    btnContainer.appendChild(loginBtn);

    cancelBtn.addEventListener('click', () => closeModal(modal));

    loginBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = pwInput.value.trim();

        if (!email || !password) {
            alert("Fill out all fields.");
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            alert("Login failed: " + error.message);
            return;
        }

        userSession = data.session;
        localStorage.setItem('supabaseSession', JSON.stringify(userSession)); // cache
        updateLoginButton();
        closeModal(modal);
        fetchMovies();
    });

    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal(modal);
    });
}

async function handleLogout() {
    await supabase.auth.signOut();
    userSession = null;
    localStorage.removeItem('supabaseSession');
    updateLoginButton();
    renderMovieCards([]);
    alert("Logged out.");
}

function updateLoginButton() {
    const btn = document.querySelector('#login-btn');
    if (!btn) return;

    btn.textContent = userSession ? 'Logout' : 'Login';
}

// -------------------------
// Initialize App
// -------------------------
document.addEventListener('DOMContentLoaded', async () => {


    // Restore cached session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        userSession = session;
    }

    const cachedSession = localStorage.getItem('supabaseSession');
    if (cachedSession) {
        userSession = JSON.parse(cachedSession);
    }

    updateLoginButton();
    fetchMovies();

    // Listen for changes in auth state (optional)
    supabase.auth.onAuthStateChange((_event, session) => {
        userSession = session;
        updateLoginButton();
        if (!userSession) {
            renderMovieCards([]); // clear movies if logged out
        } else {
            fetchMovies();
        }
    });
});


document.getElementById("loginBtn").addEventListener("click", showLoginModal);
document.getElementById("logoutBtn").addEventListener("click", logout);
