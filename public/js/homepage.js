"use strict";

window.onload = function () {
    if (getCookie("token")) {
        createMovieHandlers();
        likeHandlers();
    }
};

function errorMessage(e) {
    const error = document.getElementById("modalError");
    error.innerHTML = `
            <span style='color: red;'>
                ${e}
            </span>`;
}

function createMovieHandlers() {
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

function likeHandlers() {
    const actions = ["like", "hate", "unlike", "unhate"];
    document.addEventListener("click", async function (event) {
        const eventId = event.target.id;
        const isValidEvent = actions.some((action) =>
            eventId.startsWith(action)
        );
        if (!isValidEvent) {
            return;
        }

        const [action, movieId] = eventId.split("_");
        if (action === actions[0] || action === actions[1]) {
            await voteMovie(movieId, action === actions[0]);
        } else {
            await removeVote(movieId);
        }
        console.log("done");
        location.reload();
    });
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
