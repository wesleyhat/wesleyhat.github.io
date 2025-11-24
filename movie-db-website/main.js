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
let sorted_by_title = true; // updated automatically when sort key changes

// Restore saved session (if any) on page load
let userSession = null;

// -------------------------
// Initialize App
// -------------------------
document.addEventListener('DOMContentLoaded', () => {
    createNavBar();
    fetchMovies();
    createSortControl()
});

let scrollPosition = 0;

function lockBackground() {
    const movieContainer = document.getElementById('movie-container');
    const hamburger = document.querySelector('.hamburger');

    hamburger.style.zIndex = '0';


    // Save current scroll position
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Lock scrolling
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';

    // Disable clicks on movie container
    if (movieContainer) movieContainer.style.pointerEvents = 'none';
}

function unlockBackground() {
    const movieContainer = document.getElementById('movie-container');
    const hamburger = document.querySelector('.hamburger');

    hamburger.style.zIndex = '5000';

    // Re-enable clicks
    if (movieContainer) movieContainer.style.pointerEvents = '';

    // Restore scroll
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = 'initial';

    // Restore previous scroll position
    window.scrollTo(0, scrollPosition);
}

// --- Helper to attach close listeners for any modal ---
function setupModalClose(modalElement, closeCallback) {
    // Click outside closes modal
    const handleOutsideClick = (e) => {
        if (!modalElement.contains(e.target)) {
            modalElement.remove();
            unlockBackground();
            document.removeEventListener('click', handleOutsideClick);
            if (closeCallback) closeCallback();
        }
    };
    document.addEventListener('click', handleOutsideClick);
}


function isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function addScanBarcodeButton(btnContainer) {
    const scanBtn = document.createElement('button');
    scanBtn.textContent = "Scan from Barcode";
    scanBtn.className = "modal-btn";

    let scanner; // Html5Qrcode instance
    const readerDiv = document.getElementById('reader'); // ensure this div exists
    const output = document.createElement('div'); // optional feedback
    output.className = 'barcode-output';
    btnContainer.appendChild(output);

    scanBtn.addEventListener('click', async () => {
        // ---------- DESKTOP FALLBACK ----------
        if (!isMobile()) {
            const barcode = prompt("Enter barcode manually:");
            if (!barcode) return;
            return handleScannedBarcode(barcode); // send to lookup + TMDB
        }

        // ---------- MOBILE / CAMERA ----------
        if (!readerDiv) {
            console.error("Reader div not found in DOM");
            alert("Camera scanner cannot start: missing #reader element.");
            return;
        }

        // Initialize Html5Qrcode
        scanner = new Html5Qrcode("reader");

        const config = {
            fps: 10,
            qrbox: { width: 300, height: 100 },
            formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E
            ]
        };

        try {
            await scanner.start(
                { facingMode: "environment" },
                config,
                async (decodedText, decodedResult) => {
                    // Stop scanner once barcode detected
                    await scanner.stop().catch(console.warn);
                    readerDiv.innerHTML = ""; // remove camera feed
                    output.textContent = "Detected barcode: " + decodedText;

                    // Use the detected barcode for lookup
                    let title = await lookupBarcode(decodedText); // fetch title from barcode
                    if (!title) title = "Unscanable"; // fallback

                    const cleanedTitle = cleanTitle(title); // clean up the title

                    // Search TMDB by the cleaned title
                    let tmdbResults = await searchTmdbByTitle(cleanedTitle);

                    if (!tmdbResults || !tmdbResults.length) {
                        alert("No movies found for this barcode.");
                        return;
                    }

                    // Pick the first TMDB result (or you could let user choose)
                    const firstResult = tmdbResults[0];
                    const detail = await getTmdbDetails(firstResult.id);

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

                },
                (errorMessage) => {
                    console.log("Scan error:", errorMessage);
                }
            );
        } catch (err) {
            console.error("Failed to start scanner:", err);
            output.textContent = "ERROR: " + err;
        }
    });

    btnContainer.appendChild(scanBtn);
}

function normalizeTitleForSort(title) {
    return title
        .trim()
        .replace(/^(A |An |The )/i, '')  // remove English articles
        .trim();
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
// Sidebar Navigation with Theme Toggle
// -------------------------
function createNavBar() {
    const sidebar = document.createElement('nav');
    sidebar.id = 'sidebar-nav';

    // --- Logo / Title ---
    const logo = document.createElement('div');
    logo.className = 'sidebar-logo';
    logo.textContent = "RetroFlix";
    sidebar.appendChild(logo);

    // --- Menu list ---
    const menu = document.createElement('ul');
    menu.className = 'sidebar-menu';

    const desktopButtons = [
        {
            type: 'icon-text',
            text: 'Search',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path fill="currentColor" d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"/>
                  </svg>`,
            handler: showSearchModal
        },
        {
            type: 'text',  // new property to distinguish type
            text: 'Add Movie',
            handler: showAddMovieModal
        }
    ];    

    desktopButtons.forEach(btnData => {
        const li = document.createElement('li');
        li.className = 'desktop-menu-item';
        li.addEventListener('click', btnData.handler);
    
        if (btnData.type === 'text') {
            li.textContent = btnData.text;
        } else if (btnData.type === 'icon-text') {
            li.innerHTML = `${btnData.svg} <span>${btnData.text}</span>`;
        }
    
        menu.appendChild(li);
    });
    
    

    // Divider
    const divider = document.createElement('hr');
    menu.appendChild(divider);

    // Login/Logout
    const loginItem = document.createElement('li');
    loginItem.id = 'login-btn';
    loginItem.style.fontWeight = '600';
    loginItem.textContent = userSession ? 'Logout' : 'Login';
    loginItem.addEventListener("click", () => {
        if (userSession) {
            handleLogout();
        } else {
            showLoginModal();
        }
    });
    menu.appendChild(loginItem);

    // Attach menu to sidebar
    sidebar.appendChild(menu);

    // ---------------------------------
    // SLEEK ICON-ONLY THEME TOGGLE
    // ---------------------------------
    const themeToggle = document.createElement('div');
    themeToggle.id = "theme-toggle";

    // Sun & Moon Icons
    themeToggle.innerHTML = `
        <svg class="icon moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path fill="#ffffff" d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C388.8 576 451.3 548.8 497.3 504.6C504.6 497.6 506.7 486.7 502.6 477.5C498.5 468.3 488.9 462.6 478.8 463.4C473.9 463.8 469 464 464 464C362.4 464 280 381.6 280 280C280 207.9 321.5 145.4 382.1 115.2C391.2 110.7 396.4 100.9 395.2 90.8C394 80.7 386.6 72.5 376.7 70.3C358.4 66.2 339.4 64 320 64z"/></svg>
        <svg class="icon sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path fill="#121212" d="M303.3 112.7C196.2 121.2 112 210.8 112 320C112 434.9 205.1 528 320 528C353.3 528 384.7 520.2 412.6 506.3C309.2 482.9 232 390.5 232 280C232 214.2 259.4 154.9 303.3 112.7zM64 320C64 178.6 178.6 64 320 64C339.4 64 358.4 66.2 376.7 70.3C386.6 72.5 394 80.8 395.2 90.8C396.4 100.8 391.2 110.6 382.1 115.2C321.5 145.4 280 207.9 280 280C280 381.6 362.4 464 464 464C469 464 473.9 463.8 478.8 463.4C488.9 462.6 498.4 468.2 502.6 477.5C506.8 486.8 504.6 497.6 497.3 504.6C451.3 548.8 388.8 576 320 576C178.6 576 64 461.4 64 320z"/></svg>    `;

    // Initial theme
    let currentTheme =
        localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

    document.documentElement.setAttribute('data-theme', currentTheme);

    // Click handler
    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
    });

    sidebar.appendChild(themeToggle);

    // Add to document
    document.body.prepend(sidebar);
}

function createSortControl() {
    const wrapper = document.getElementById('sort-control');
    if (!wrapper) return;

    wrapper.innerHTML = ''; // clear old content
    wrapper.classList.add('sort-wrapper');

    // --- Dropdown ---
    const select = document.createElement('select');
    select.className = 'sort-select';

    const options = [
        { value: 'title', label: 'Title' },
        { value: 'release_date', label: 'Release' },
        { value: 'rating', label: 'Rating' },
        { value: 'genre', label: 'Genre' }, // <-- ADD THIS
    ];

    options.forEach(opt => {
        const optionEl = document.createElement('option');
        optionEl.value = opt.value;
        optionEl.textContent = opt.label;
        select.appendChild(optionEl);
    });

    if (!userSession) {
        select.disabled = true;
    }

    select.value = currentSort.key;
    select.addEventListener('change', () => {

        currentSort.key = select.value;
        currentSort.ascending = true;
        applyFiltersAndSort();
    });

    wrapper.appendChild(select);

    // --- Arrow toggle ---
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sort-toggle';
    toggleBtn.textContent = currentSort.ascending ? '↑' : '↓';

    if (!userSession) {
        toggleBtn.disabled = true;
    }

    toggleBtn.addEventListener('click', () => {

        currentSort.ascending = !currentSort.ascending;
        toggleBtn.textContent = currentSort.ascending ? '↑' : '↓';
        applyFiltersAndSort();
    });

    wrapper.appendChild(toggleBtn);

    const filterBtn = document.createElement('div');
    filterBtn.className = 'filter-btn'
    filterBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path fill="currentColor" d="M96 128C83.1 128 71.4 135.8 66.4 147.8C61.4 159.8 64.2 173.5 73.4 182.6L256 365.3L256 480C256 488.5 259.4 496.6 265.4 502.6L329.4 566.6C338.6 575.8 352.3 578.5 364.3 573.5C376.3 568.5 384 556.9 384 544L384 365.3L566.6 182.7C575.8 173.5 578.5 159.8 573.5 147.8C568.5 135.8 556.9 128 544 128L96 128z"/></svg>`

    if (!userSession) {
        toggleBtn.disabled = true;
    }

    filterBtn.addEventListener('click', showFilterModal);

    wrapper.appendChild(filterBtn);
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

    // -----------------------------
    // SEARCH FILTER
    // -----------------------------
    if (activeSearch) {
        const searchLower = activeSearch.toLowerCase();
        filtered = filtered.filter(m => m.title.toLowerCase().includes(searchLower));
    }

    // -----------------------------
    // OTHER FILTERS
    // -----------------------------
    if (activeFilters.genre) {
        filtered = filtered.filter(m =>
            m.genre?.split(',').map(g => g.trim()).includes(activeFilters.genre)
        );
    }

    if (activeFilters.tag) {
        filtered = filtered.filter(m =>
            m.tags?.split(',').map(t => t.trim()).includes(activeFilters.tag)
        );
    }

    if (activeFilters.cast) {
        filtered = filtered.filter(m =>
            m.cast?.split(',').map(c => c.trim()).includes(activeFilters.cast)
        );
    }

    // -----------------------------
    // SORT
    // -----------------------------
    filtered.sort((a, b) => {
        let valA = a[currentSort.key] || '';
        let valB = b[currentSort.key] || '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return currentSort.ascending ? -1 : 1;
        if (valA > valB) return currentSort.ascending ? 1 : -1;
        return 0;
    });

    // -----------------------------
    // DETERMINE GROUPING
    // -----------------------------
    const isTitleSort = currentSort.key === "title";
    const isGenreSort = currentSort.key === "genre";

    // -----------------------------
    // RENDER MOVIES
    // -----------------------------
    renderMovieCards(filtered, isTitleSort, isGenreSort);
}

function renderMovieCards(movies, sortedByTitle, groupedByGenre) {
    let container = document.getElementById('movie-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'movie-container';
        container.className = 'container';
        document.body.appendChild(container);
    }
    container.innerHTML = '';

    // -----------------------------
    // HERO SECTION
    // -----------------------------
    const heroCont = document.createElement('div');
    heroCont.className = 'hero-cont';

    const hero = document.createElement('div');
    hero.className = 'hero';
    hero.textContent = 'VHS Collection';
    heroCont.appendChild(hero);

    const sortControl = document.createElement('div');
    sortControl.id = 'sort-control';
    heroCont.appendChild(sortControl);

    container.appendChild(heroCont);

    createSortControl(); // existing function

    if (!movies.length) {
        const noMoviesWrapper = document.createElement('div');
        noMoviesWrapper.style.display = 'flex';
        noMoviesWrapper.style.flexDirection = 'column';
        noMoviesWrapper.style.alignItems = 'center';
        noMoviesWrapper.style.justifyContent = 'flex-start';
        noMoviesWrapper.style.height = '100%'; // adjust if you have header/footer
        noMoviesWrapper.style.marginTop = '50px'
        noMoviesWrapper.style.gap = '20px'; // spacing between SVG and optional text

        // SVG
        const svgWrapper = document.createElement('div');
        svgWrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="120" height="120" fill="var(--text-secondary)">
            <path fill="text-primary" d="M96 160C96 124.7 124.7 96 160 96L480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160zM144 432L144 464C144 472.8 151.2 480 160 480L192 480C200.8 480 208 472.8 208 464L208 432C208 423.2 200.8 416 192 416L160 416C151.2 416 144 423.2 144 432zM448 416C439.2 416 432 423.2 432 432L432 464C432 472.8 439.2 480 448 480L480 480C488.8 480 496 472.8 496 464L496 432C496 423.2 488.8 416 480 416L448 416zM144 304L144 336C144 344.8 151.2 352 160 352L192 352C200.8 352 208 344.8 208 336L208 304C208 295.2 200.8 288 192 288L160 288C151.2 288 144 295.2 144 304zM448 288C439.2 288 432 295.2 432 304L432 336C432 344.8 439.2 352 448 352L480 352C488.8 352 496 344.8 496 336L496 304C496 295.2 488.8 288 480 288L448 288zM144 176L144 208C144 216.8 151.2 224 160 224L192 224C200.8 224 208 216.8 208 208L208 176C208 167.2 200.8 160 192 160L160 160C151.2 160 144 167.2 144 176zM448 160C439.2 160 432 167.2 432 176L432 208C432 216.8 439.2 224 448 224L480 224C488.8 224 496 216.8 496 208L496 176C496 167.2 488.8 160 480 160L448 160z"/>
        </svg>`;
        noMoviesWrapper.appendChild(svgWrapper);

        // Optional text below SVG
        const noMoviesText = document.createElement('p');
        noMoviesText.textContent = 'No movies to display.';
        noMoviesText.style.color = 'var(--text-secondary)';
        noMoviesWrapper.appendChild(noMoviesText);

        container.appendChild(noMoviesWrapper);
        return;
    }

    // -----------------------------
    // TITLE GROUPING (A–Z)
    // -----------------------------
    if (sortedByTitle) {
        const grouped = {};
    
        // --- Build grouped object ---
        movies.forEach(movie => {
            let normalized = normalizeTitleForSort(movie.title);
            let firstChar = normalized.charAt(0).toUpperCase();
            if (!/[A-Z]/.test(firstChar)) firstChar = '#';
            if (!grouped[firstChar]) grouped[firstChar] = [];
            grouped[firstChar].push(movie);
        });
    
        // --- TOP BAR ORDER (always A → Z → #) ---
        const barLetters = Object.keys(grouped).filter(l => l !== '#').sort();
        if (grouped['#']) barLetters.push('#');
    
        // --- PAGE GROUP ORDER (changes with sort) ---
        const azLetters = Object.keys(grouped).filter(l => l !== '#').sort();
        let groupOrder;
    
        if (currentSort.ascending) {
            // A → Z → #
            groupOrder = [...azLetters];
            if (grouped['#']) groupOrder.push('#');
        } else {
            // # → Z → A
            groupOrder = [];
            if (grouped['#']) groupOrder.push('#');
            groupOrder = groupOrder.concat([...azLetters].reverse());
        }
    
        // --- Top A–Z Bar ---
        const bar = document.createElement('div');
        bar.className = 'az-bar';
    
        const allOption = document.createElement('span');
        allOption.textContent = 'ALL';
        allOption.className = 'az-item active';
        allOption.addEventListener('click', () => {
            document.querySelectorAll('.movie-group').forEach(g => g.style.display = '');
            document.querySelectorAll('.az-item').forEach(el => el.classList.remove('active'));
            allOption.classList.add('active');
        });
        bar.appendChild(allOption);
    
        barLetters.forEach(letter => {
            const item = document.createElement('span');
            item.textContent = letter;
            item.className = 'az-item';
            item.addEventListener('click', () => {
                document.querySelectorAll('.movie-group').forEach(g => {
                    g.style.display = g.dataset.letter === letter ? '' : 'none';
                });
                document.querySelectorAll('.az-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
            });
            bar.appendChild(item);
        });
    
        container.appendChild(bar);
    
        // --- Render groups in final dynamic order ---
        groupOrder.forEach(letter => {
            const groupWrapper = document.createElement('div');
            groupWrapper.className = 'movie-group';
            groupWrapper.dataset.letter = letter;
    
            const header = document.createElement('h2');
            header.textContent = letter;
            header.style.fontWeight = '200';
            groupWrapper.appendChild(header);
    
            const line = document.createElement('hr');
            groupWrapper.appendChild(line);
    
            const cardsWrapper = document.createElement('div');
            cardsWrapper.className = 'movies-wrapper';
    
            // Reverse movies *inside* each group depending on sort
            const moviesInGroup = [...grouped[letter]].sort((a, b) => {
                const A = normalizeTitleForSort(a.title).toUpperCase();
                const B = normalizeTitleForSort(b.title).toUpperCase();
            
                if (A < B) return currentSort.ascending ? -1 : 1;
                if (A > B) return currentSort.ascending ? 1 : -1;
                return 0;
            });

            moviesInGroup.forEach(movie => {
                const card = createMovieCard(movie);
                cardsWrapper.appendChild(card);
            });

            groupWrapper.appendChild(cardsWrapper);
            container.appendChild(groupWrapper);
        });
    }
    

    // -----------------------------
    // GENRE GROUPING
    // -----------------------------
    else if (groupedByGenre) {
        const grouped = {};
        movies.forEach(movie => {
            if (!movie.genre) return;
            movie.genre.split(',').map(g => g.trim()).forEach(genre => {
                if (!grouped[genre]) grouped[genre] = [];
                grouped[genre].push(movie);
            });
        });

        // Sort genres alphabetically
        let genres = Object.keys(grouped).sort();
        if (!currentSort.ascending) genres.reverse();

        genres.forEach(genre => {
            const groupWrapper = document.createElement('div');
            groupWrapper.className = 'movie-group';
            groupWrapper.dataset.letter = genre;

            const header = document.createElement('h2');
            header.textContent = genre;
            header.style.fontWeight = '200';
            groupWrapper.appendChild(header);

            const line = document.createElement('hr');
            groupWrapper.appendChild(line);

            const cardsWrapper = document.createElement('div');
            cardsWrapper.className = 'movies-wrapper';

            // Sort movies within the genre alphabetically by title
            let moviesInGroup = grouped[genre].sort((a, b) => {
                let titleA = (a.title || '').toLowerCase();
                let titleB = (b.title || '').toLowerCase();
                if (titleA < titleB) return currentSort.ascending ? -1 : 1;
                if (titleA > titleB) return currentSort.ascending ? 1 : -1;
                return 0;
            });

            moviesInGroup.forEach(movie => {
                const card = createMovieCard(movie);
                cardsWrapper.appendChild(card);
            });

            groupWrapper.appendChild(cardsWrapper);
            container.appendChild(groupWrapper);
        });
    }
 

    // -----------------------------
    // DEFAULT (no grouping)
    // -----------------------------
    else {
        const groupWrapper = document.createElement('div');
        groupWrapper.className = 'movie-group';
        groupWrapper.dataset.letter = 'all';

        const line = document.createElement('hr');
        groupWrapper.appendChild(line);

        const cardsWrapper = document.createElement('div');
        cardsWrapper.className = 'movies-wrapper';

        movies.forEach(movie => {
            const card = createMovieCard(movie);
            cardsWrapper.appendChild(card);
        });

        groupWrapper.appendChild(cardsWrapper);
        container.appendChild(groupWrapper);
    }

    
}

// -----------------------------
// HELPER: create a movie card
// -----------------------------
function createMovieCard(movie) {
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
    title.setAttribute('title', movie.title);
    content.appendChild(title);

    const release = document.createElement('p');
    release.textContent = movie.release_date?.substring(0, 4) || 'N/A';
    content.appendChild(release);

    card.appendChild(content);

    card.addEventListener('click', () => showMovieDetails(movie));

    return card;
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

    if (!userSession) {
        showLoginModal();
        return; // ← stop execution here if not logged in
    }

    const sidebar = document.getElementById('sidebar-nav');
    const hamburger = document.querySelector('.hamburger');

    // Hide sidebar if it’s open
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        hamburger.classList.remove('active');
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');

    lockBackground();

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

    // -------------------------
    // Close modal helper
    // -------------------------
    // Use a single close function so we unlock the background correctly
    const close = () => closeModal(modal);

    cancelBtn.addEventListener('click', close);
    searchBtn.addEventListener('click', () => {
        activeSearch = input.value.trim();
        applyFiltersAndSort();
        close(); // <-- ensures background is unlocked
    });

    // Close modal if clicking outside content
    modal.addEventListener('click', e => {
        if (e.target === modal) close();
    });
}

function showSortModal() {

    if (!userSession) {
        showLoginModal();
        return; // ← stop execution here if not logged in
    }

    const sidebar = document.getElementById('sidebar-nav');
    const hamburger = document.querySelector('.hamburger');

    // Hide sidebar if it’s open
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        hamburger.classList.remove('active');
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');

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
    if (!userSession) {
        showLoginModal();
        return; // stop execution if not logged in
    }

    const sidebar = document.getElementById('sidebar-nav');
    const hamburger = document.querySelector('.hamburger');

    // Hide sidebar if it’s open
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        hamburger.classList.remove('active');
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);

    // --- Lock background scroll & clicks ---
    lockBackground();

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

    content.appendChild(createDropdown('Genre', 'genre', allGenres));
    content.appendChild(createDropdown('\u00A0\u00A0\u00A0\u00A0Tag', 'tag', allTags));

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

    // --- Close handlers ---
    const close = () => closeModal(modal);

    cancelBtn.addEventListener('click', close);
    applyBtn.addEventListener('click', () => { applyFiltersAndSort(); close(); });

    // Close modal if clicked outside content
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
}

// Updated closeModal to unlock background
function closeModal(modal) {
    modal.remove();
    unlockBackground();
}

// -------------------------
// Movie Modal with Edit
// -------------------------
async function showMovieDetails(movie) {

    lockBackground();

    const modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');

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

        // Add a special class for description
        if (label === 'Description') valSpan.className = 'description-text';

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

    const close = () => closeModal(modal);

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

    // Close modal if clicking outside content
    modal.addEventListener('click', e => {
        if (e.target === modal) close();
    });

}

// -------------------------
// Add Movie Modal with multiple TMDB results
// -------------------------
async function showAddMovieModal() {

    if (!userSession) {
        showLoginModal();
        return; // ← stop execution here if not logged in
    }

    const sidebar = document.getElementById('sidebar-nav');
    const hamburger = document.querySelector('.hamburger');

    // Hide sidebar if it’s open
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        hamburger.classList.remove('active');
    }

    lockBackground();

    const modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');

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
        document.body.classList.remove('modal-open');
    });

    const close = () => closeModal(modal);

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

    // Close modal if clicking outside content
    modal.addEventListener('click', e => {
        if (e.target === modal) close();
    });
}

// -------------------------
// Preview Modal (mimics movie detail modal)
// -------------------------
function showPreviewModal(movieData, parentModal) {

    lockBackground();

    const modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');

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

    const close = () => closeModal(modal);

    cancelBtn.addEventListener('click', () => {
        modal.remove();
        document.body.classList.remove('modal-open');
    });

    addBtn.addEventListener('click', async () => {
        try {
            const { error } = await supabase.from('Movies').insert([movieData]);
            if (error) throw error;

            modal.remove();
            if (parentModal) parentModal.remove();
            document.body.classList.remove('modal-open');
            alert('Movie added successfully!');
            fetchMovies();
        } catch (err) {
            console.error('Error adding movie:', err);
            alert('Failed to add movie. Check console.');
        }
    });

    // Close modal if clicking outside content
    modal.addEventListener('click', e => {
        if (e.target === modal) close();
    });
}

function showLoginModal() {
    const sidebar = document.getElementById('sidebar-nav');
    const hamburger = document.querySelector('.hamburger');

    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        hamburger.classList.remove('active');
    }

    lockBackground();

    const modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');

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
    emailInput.autocomplete = 'email';
    content.appendChild(emailInput);

    const pwInput = document.createElement('input');
    pwInput.type = 'password';
    pwInput.placeholder = 'Password';
    pwInput.className = 'modal-input';
    pwInput.autocomplete = 'current-password';
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

    // -----------------------------
    // Auto-login control
    // -----------------------------
    let autoLoginTriggered = false;

    const attemptLogin = async () => {
        const email = emailInput.value.trim();
        const password = pwInput.value.trim();

        if (!email || !password) return;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            alert("Login failed: " + error.message);
            return;
        }

        userSession = data.session;

        updateLoginButton();
        closeModal(modal);
        fetchMovies();
    };

    // -----------------------------
    // Manual login triggers
    // -----------------------------
    loginBtn.addEventListener('click', attemptLogin);

    [emailInput, pwInput].forEach(input => {
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') attemptLogin();
        });
    });

    // -----------------------------
    // Detect iOS / saved password autofill
    // -----------------------------
    // Use rAF to detect autofill after inputs render
    requestAnimationFrame(() => {
        if (emailInput.value && pwInput.value) {
            autoLoginTriggered = true;
            setTimeout(attemptLogin, 50);
        }
    });

    // -----------------------------
    // Close modal on background click
    // -----------------------------
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal(modal);
    });
}

async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Logout failed:", error.message);
        return;
    }

    userSession = null;
    updateLoginButton();
    renderMovieCards([]); // clear movies

    const sidebar = document.getElementById('sidebar-nav');
    const hamburger = document.querySelector('.hamburger');

    // Hide sidebar if it’s open
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        hamburger.classList.remove('active');
    }
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
    // Get current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    userSession = session; // null if not logged in

    updateLoginButton();
    if (userSession) {
        fetchMovies();
    }

    supabase.auth.onAuthStateChange((_event, session) => {
        userSession = session;
        updateLoginButton();
        if (!userSession) {
            renderMovieCards([]);
        } else {
            fetchMovies();
        }
    });

    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.getElementById('sidebar-nav');
    const movieContainer = document.getElementById('movie-container');

    if (hamburger && sidebar && movieContainer) {
        hamburger.addEventListener('click', () => {
            const isActive = sidebar.classList.toggle('active');
            hamburger.classList.toggle('active');

            if (isActive) {
                // --- Disable scrolling ---
                document.body.classList.add('no-scroll');

                // --- Disable clicks on movie container ---
                movieContainer.style.pointerEvents = 'none';

                // --- Close sidebar on outside click ---
                const handleOutsideClick = (e) => {
                    if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
                        sidebar.classList.remove('active');
                        hamburger.classList.remove('active');

                        document.body.classList.remove('no-scroll');
                        movieContainer.style.pointerEvents = '';

                        document.removeEventListener('click', handleOutsideClick);
                    }
                };
                document.addEventListener('click', handleOutsideClick);
            } else {
                document.body.classList.remove('no-scroll');
                movieContainer.style.pointerEvents = '';
            }
        });
    }
});


