"use strict";

window.onload = function () {
    if (getCookie("token")) {
        addCreateMovieHandlers();
        addVoteHandlers();
        addLogoutEventHandler();
    } else {
        addLoginModalHandler();
        addRegisterModalHandler();
    }
    addPaginationHandlers();
};

function errorMessage(error, id) {
    const errorElement = document.getElementById(id);
    errorElement.innerHTML = `
            <span style='color: red;'>
                ${error}
            </span>`;
}

function addLogoutEventHandler() {
    const logout = document.getElementById("logout");
    logout.addEventListener("click", function () {
        if (!getCookie("token")) {
            return;
        }

        document.cookie =
            "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        location.reload();
    });
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
                await axios.post("/api/movies", data);
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

    const params = getCurrentPaginationParams();
    await updateMoviesPage(params);
}

function addPaginationHandlers() {
    const elements = document.getElementsByClassName("_pagination");
    Array.from(elements).forEach(function (element) {
        element.addEventListener("click", paginationHandler);
    });
}

async function paginationHandler(event) {
    const params = preparePaginationParams(event.target.dataset);
    if (!params) {
        return;
    }

    await updateMoviesPage(params);
}

async function updateMoviesPage(params) {
    try {
        const response = await axios.get("/api/movies", { params });
        const moviesList = document.getElementById("moviesList");
        moviesList.innerHTML = response.data.html;

        if (getCookie("token")) {
            // Re-initiate vote handlers on new elements
            addVoteHandlers();
        }

        if (params.page === 0) {
            document
                .getElementById("paginationPrevious")
                .classList.add("disabled");
        } else {
            document
                .getElementById("paginationPrevious")
                .classList.remove("disabled");
        }

        const totalPages =
            Math.ceil(+response.data.data.totalMovies / params.limit) - 1;

        if (totalPages === params.page) {
            document.getElementById("paginationNext").classList.add("disabled");
        } else {
            document
                .getElementById("paginationNext")
                .classList.remove("disabled");
        }

        updateUrlParams(params);
    } catch (error) {
        console.error(error);
    }
}

function updateUrlParams(params) {
    const url = new URL(window.location.href);
    url.searchParams.set("page", params.page);
    url.searchParams.set("order", params.order);
    url.searchParams.set("sort", params.sort);

    window.history.pushState(null, null, url);
}

function preparePaginationParams(eventData) {
    const action = eventData.action;
    let queryParams = getCurrentPaginationParams();

    if (action === "next") {
        queryParams.page++;
    } else if (action === "previous") {
        if (queryParams.page === 0) {
            console.error("Invalid page");
            return null;
        }
        queryParams.page--;
    } else if (action === "sort") {
        const orderBy = eventData.order;
        if (orderBy === queryParams.order) {
            queryParams.sort = queryParams.sort === "DESC" ? "ASC" : "DESC";
        } else if (
            orderBy === "date" ||
            orderBy === "likes" ||
            orderBy === "hates"
        ) {
            queryParams.order = orderBy;
        } else {
            console.error("Invalid sort");
            return null;
        }
    }
    return queryParams;
}

function getCurrentPaginationParams() {
    const url = new URL(window.location.href);
    const urlQueryParams = url.searchParams;
    const params = {
        limit: 5,
        page: urlQueryParams.get("page") ? +urlQueryParams.get("page") : 0,
        order: urlQueryParams.get("order")
            ? urlQueryParams.get("order")
            : "date",
        sort: urlQueryParams.get("sort") ? urlQueryParams.get("sort") : "DESC",
        creatorId: null,
    };

    const pathRegEx = new RegExp(/\/users\/\d*/);
    if (pathRegEx.test(url.pathname)) {
        const creatorId = url.pathname.split("/")[2];
        params.creatorId = creatorId;
    }
    return params;
}

async function voteMovie(movieId, like) {
    const data = {
        movieId,
        like,
    };

    try {
        await axios.post("/api/votes", data);
    } catch (error) {
        console.error(error);
    }
}

async function removeVote(movieId) {
    try {
        await axios.delete(`/api/votes/${movieId}`);
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
