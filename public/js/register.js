"use strict";

window.onload = function () {
    document
        .getElementById("registerForm")
        .addEventListener("submit", async function (event) {
            event.preventDefault();

            const data = {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                password: document.getElementById("password").value,
            };

            try {
                await axios.post("/register", data);
                window.location.href = "/login";
            } catch (error) {
                errorMessage(error.response.data.error);
            }
        });
};

function errorMessage(e) {
    const error = document.getElementById("error");
    error.innerHTML = `
                <span style='color: red;'>
                    ${e}
                </span>`;
}
