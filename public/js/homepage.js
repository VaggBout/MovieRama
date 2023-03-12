"use strict";

window.onload = function () {
    if (getCookie("token")) {
        addCreateMovieHandlers();
        addVoteHandlers();
    } else {
        addLoginModalHandler();
        addRegisterModalHandler();
    }
};

function errorMessage(error, id) {
    const errorElement = document.getElementById(id);
    errorElement.innerHTML = `
            <span style='color: red;'>
                ${error}
            </span>`;
}

function addLoginModalHandler() {
    const modal = document.getElementById("loginModal");
    modal.addEventListener("shown.bs.modal", function () {
        document.getElementById("loginEmail").focus();
    });

    document
        .getElementById("login")
        .addEventListener("click", async function (event) {
            event.preventDefault();

            const data = {
                email: document.getElementById("loginEmail").value,
                password: document.getElementById("loginPassword").value,
            };

            try {
                await axios.post("/api/login", data);
                const modalElement = document.getElementById("loginModal");
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();
                document.getElementById("loginForm").reset();
                location.reload();
            } catch (error) {
                document.getElementById("loginForm").reset();
                errorMessage(error.response.data.error, "loginModalError");
            }
        });
}

function addRegisterModalHandler() {
    const modal = document.getElementById("registerModal");
    modal.addEventListener("shown.bs.modal", function () {
        document.getElementById("registerName").focus();
    });

    document
        .getElementById("register")
        .addEventListener("click", async function (event) {
            event.preventDefault();

            const data = {
                name: document.getElementById("registerName").value,
                email: document.getElementById("registerEmail").value,
                password: document.getElementById("registerPassword").value,
            };

            try {
                await axios.post("/api/register", data);
                const modalElement = document.getElementById("registerModal");
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();
                document.getElementById("registerForm").reset();

                const loginModal = new bootstrap.Modal(
                    document.getElementById("loginModal"),
                    {}
                );
                loginModal.show();
            } catch (error) {
                document.getElementById("registerForm").reset();
                errorMessage(error.response.data.error, "registerModalError");
            }
        });
}

function addCreateMovieHandlers() {
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
                await axios.post("/api/movie", data);
                const modalElement = document.getElementById("newMovieModal");
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();
                document.getElementById("newMovieForm").reset();
            } catch (error) {
                document.getElementById("newMovieForm").reset();
                errorMessage(error.response.data.error, "newMovieModalError");
            }
        });
}

function addVoteHandlers() {
    const elements = document.getElementsByClassName("votableElements");
    Array.from(elements).forEach(function (element) {
        element.addEventListener("click", voteHandler);
    });
}

async function voteHandler(event) {
    const action = event.target.dataset.action;
    const movieId = event.target.dataset.movie;

    if (action === "like" || action === "hate") {
        await voteMovie(movieId, action === "like");
    } else {
        await removeVote(movieId);
    }
    location.reload();
}

async function voteMovie(movieId, like) {
    const data = {
        movieId,
        like,
    };

    try {
        await axios.post("/api/vote", data);
    } catch (error) {
        console.error(error);
    }
}

async function removeVote(movieId) {
    try {
        await axios.delete(`/api/vote/${movieId}`);
    } catch (error) {
        console.error(error);
    }
}

function getCookie(name) {
    const dc = document.cookie;
    const prefix = name + "=";
    let begin = dc.indexOf("; " + prefix);
    let end = 0;
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    } else {
        begin += 2;
        end = document.cookie.indexOf(";", begin);
        if (end == -1) end = dc.length;
    }
    return decodeURI(dc.substring(begin + prefix.length, end));
}
