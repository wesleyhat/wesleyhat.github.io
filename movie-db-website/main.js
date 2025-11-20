function addScanBarcodeButton(btnContainer) {
    const scanBtn = document.createElement('button');
    scanBtn.textContent = "Scan from Barcode";
    scanBtn.className = "modal-btn";

    scanBtn.addEventListener('click', async () => {

        // Desktop fallback: manual entry
        if (!isMobile()) {
            const barcode = prompt("Enter barcode manually:");
            if (!barcode) return;
            return handleScannedBarcode(barcode);
        }

        // MOBILE → Use html5-qrcode scanner
        await startHtml5QrCodeScanner();
    });

    btnContainer.appendChild(scanBtn);

    // ========================================================================
    // MOBILE: html5-qrcode scanner
    // ========================================================================
    async function startHtml5QrCodeScanner() {
        const overlay = document.createElement("div");
        overlay.className = "barcode-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0,0,0,0.9)";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = 9999;
        overlay.innerHTML = "<p style='color:white;margin-bottom:10px;'>Point your camera at the barcode</p><div id='html5qr-reader'></div>";
        document.body.appendChild(overlay);

        // Include html5-qrcode library if not already loaded
        if (typeof Html5Qrcode === "undefined") {
            await new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = "https://unpkg.com/html5-qrcode";
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        const html5QrCode = new Html5Qrcode("html5qr-reader");

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
            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText, decodedResult) => {
                    // Barcode detected
                    html5QrCode.stop().catch(console.warn);
                    overlay.remove();
                    handleScannedBarcode(decodedText);
                },
                (errorMessage) => {
                    // optional: frame scan failed
                    console.log("Scan frame error:", errorMessage);
                }
            );
        } catch (err) {
            console.error("html5-qrcode failed:", err);
            overlay.remove();
            alert("Camera scan failed. Try manual entry.");
        }
    }

    // ========================================================================
    // Helper: Look up and show TMDB results
    // ========================================================================
    async function handleScannedBarcode(barcode) {
        let movieTitle = await lookupBarcode(barcode);
        if (!movieTitle) movieTitle = "Unscanable";
        movieTitle = cleanTitle(movieTitle);

        const tmdbResults = await searchTmdbByTitle(movieTitle);
        if (!tmdbResults || tmdbResults.length === 0) {
            alert("No movies found for this barcode.");
            return;
        }

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

        showPreviewModal(movieData, null);
    }
}
