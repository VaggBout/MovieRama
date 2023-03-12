"use strict";

window.onload = function () {
    if (getCookie("token")) {
        addCreateMovieHandlers();
        addVoteHandlers();
    }
};

function errorMessage(e) {
    const error = document.getElementById("modalError");
    error.innerHTML = `
            <span style='color: red;'>
                ${e}
            </span>`;
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
        await axios.post("/vote", data);
    } catch (error) {
        console.error(error);
    }
}

async function removeVote(movieId) {
    try {
        await axios.delete(`/vote/${movieId}`);
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
