"use strict";

window.onload = function () {
    document
        .getElementById("loginForm")
        .addEventListener("submit", async function (event) {
            event.preventDefault();

            const data = {
                email: document.getElementById("email").value,
                password: document.getElementById("password").value,
            };

            try {
                await axios.post("/login", data);
                window.location.href = "/";
            } catch (error) {
                errorMessage(
                    error.response.data.error
                        ? error.response.data.error
                        : "Invalid credentials"
                );
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
