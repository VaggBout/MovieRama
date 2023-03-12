"use strict";

window.onload = function () {
    const modal = document.getElementById("newMovieModal");
    modal.addEventListener("shown.bs.modal", function () {
        document.getElementById("newMovieTitle").focus();
    });

    document
        .getElementById("saveNewMovie")
        .addEventListener("click", async function (event) {
            event.preventDefault();

            const data = {
                title: document.getElementById("newMovieTitle").value,
                description: document.getElementById("newMovieDescription")
                    .value,
            };

            try {
                await axios.post("/movie", data);
                const modalElement = document.getElementById("newMovieModal");
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();
                document.getElementById("newMovieForm").reset();
            } catch (error) {
                document.getElementById("newMovieForm").reset();
                errorMessage(
                    error.response.data.error
                        ? error.response.data.error
                        : "Something went wrong."
                );
            }
        });

    function errorMessage(e) {
        const error = document.getElementById("modalError");
        error.innerHTML = `
                <span style='color: red;'>
                    ${e}
                </span>`;
    }
};
