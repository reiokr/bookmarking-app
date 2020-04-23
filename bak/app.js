// get everything needed from DOM
const body = document.body,
    input = document.querySelector("input[type=text]"),
    overlay = document.querySelector(".overlay"),
    floater = document.querySelector(".floater"),
    floaterTop = document.querySelector('.floater-top'),
    addBtn = document.querySelector('[name="add"]'),
    output = document.querySelector(".output"),
    bookmarkForm = document.querySelector(".bookmark-form"),
    loader = document.querySelector(".loader"),
    yt = document.getElementById('yt'),
    image = document.querySelector('.img'),
    bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [],
    apiUrl = "https://opengraph.io/api/1.1/site",
    appId = "58858c7bcf07b61e64257391";

// zoom floater on screen
function showFloater() {
    body.classList.add("show-floater")
}
// unzoom floater
function closeFloater() {
    body.classList.contains("show-floater") && body.classList.remove("show-floater")
}

// show loading image on screen when proccessing fetch
function showLoader() {
    loader.classList.add("show-loader"), addBtn.classList.add("hide-floater"), input.classList.add("hide-floater"), yt.classList.add('hide-floater')
}

function showLoader1(id) {
    const loader1 = document.getElementById("loader" + id);
    const card = document.getElementById(id).firstElementChild;
    card.style.visibility = "hidden";
    loader1.classList.add("show-loader");
}

// hide loader image
function removeLoader() {
    loader.classList.remove("show-loader"), addBtn.classList.remove("hide-floater"), input.classList.remove("hide-floater"), yt.classList.remove('hide-floater')
}

function removeLoader1(id) {
    const card = document.getElementById(id).firstElementChild;
    card.style.visibility = "visible";
    loader1.classList.remove("show-loader");
}

// show error message
function errorMsg(msg) {
    if (floaterTop.classList.contains('msg')) return;
    else {
        errMsg = document.createElement('p');
        errMsg.className = ('err-msg');
        errMsg.innerText = msg;
        floaterTop.appendChild(errMsg);
        floaterTop.classList.add('msg')
    }
    setTimeout(() => {
        errMsg.remove();
        floaterTop.classList.remove('msg');
    }, 5000)
}

// convert seconds to hh:mm:ss
var toHHMMSS = (secs) => {
    var sec_num = parseInt(secs, 10)
    var hours = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60
    return [hours, minutes, seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v, i) => v !== "00" || i > 0)
        .join(":")
}

// validate url with regular expressions
function checkBookmark(bookmark) {
    // check if input has http:// and if not then append
    /^https?:\/\//i.test(bookmark) || (bookmark = `http://${bookmark}`);
    // check if youtube video ends ?t=[digits] or &t=[digits]
    re = /[\?&]t=[0-9]{1,}$/;
    let urlEnd;
    let videoStart;
    if (!re.test(bookmark)) {
        urlEnd = "";
        videoStart = "";
    } else {
        urlEnd = re.exec(bookmark)[0]; // if youtube url ends with video start time .. add to url end 
        let time = toHHMMSS(urlEnd.replace(/[\?&]t=/, '')); // convert to secons minutes and hours
        videoStart = `<br><p class="video-start">Video start at ${time}</p>`; // create info text in screen
    };
    return [bookmark, urlEnd, videoStart];
}
// check if url is from YouTube and make some changes with regular expressions
function checkYouTubeUrl(url) {
    // check if input is YouTube video and replace www.youtube.com/watch?v= to youtu.be/
    let youtubeUrl = url;
    let yt = /www\.youtube\.com\/watch\?v=/i;
    let newUrl;
    if (!yt.test(youtubeUrl)) {} else {
        let newString = yt.exec(youtubeUrl);
        newUrl = youtubeUrl.replace(newString[0], 'youtu.be/');
        url = newUrl;
    }
    // check if in youtube url ?list has changed to &list and change it back
    let youtubeUrlnew = url
    let andUrl;
    let and = /&list/;
    if (!and.test(youtubeUrlnew)) {
        // console.log('does not contain &list')
    } else {
        let newString = and.exec(youtubeUrlnew);
        andUrl = youtubeUrlnew.replace(newString[0], '?list');
        // console.log(`${youtubeUrlnew} contains ${and.source}`)
        url = andUrl;
    }
    return url
}

// fetch url info from https://opengraph.io/api/1.1/site
function getUrl(url, bookmark) {
    // get variables from checkBookmark
    let urlEnd = checkBookmark(bookmark)[1];
    let videoStart = checkBookmark(bookmark)[2];

    // fetch url
    fetch(`${apiUrl}/${url}?app_id=${appId}`)
        .then(response => response.json())
        .then(data => {
            const bookmark = {
                title: data.hybridGraph.title + videoStart,
                image: data.hybridGraph.image,
                url: data.hybridGraph.url + urlEnd
            };
            // check url
            newUrl = checkYouTubeUrl(bookmark.url);
            bookmark.url = newUrl;

            // add bookmark to the list
            bookmarks.push(bookmark);
            // show bookmarks on the screen

            fillBookmarksList(bookmarks);
            // store bookmarks in local storage
            storeBookmarks(bookmarks);
            // reset input form
            bookmarkForm.reset();
            // remove loader image
            removeLoader();
            // handle errors
        }).catch(error => {
            console.log(error);
            errorMsg("We can't find what you are looking!");
            removeLoader();
            bookmarkForm.reset();
        });
}

function getEditedUrl(url, id, bookmark) {
    // get variables from checkBookmark
    let urlEnd = checkBookmark(bookmark)[1];
    let videoStart = checkBookmark(bookmark)[2];

    // fetch url
    fetch(`${apiUrl}/${url}?app_id=${appId}`)
        .then(response => response.json())
        .then(data => {
            const bookmark = {
                title: data.hybridGraph.title + videoStart,
                image: data.hybridGraph.image,
                url: data.hybridGraph.url + urlEnd
            };
            newUrl = checkYouTubeUrl(bookmark.url);
            bookmark.url = newUrl;
            fillBookmark(bookmark, id);
            bookmarks[id] = bookmark;
            storeBookmarks(bookmarks);
            // removeLoader1();
        })
        .catch(error => {
            console.log(error);
            removeLoader1(id);
            bookmarkForm.reset();
        })
}

// create new bookmark
function showBookmark(e) {
    e.preventDefault();
    // bookmark from input field
    let bookmark = input.value;
    //check if input value is empty string
    if (!input.value) {
        errorMsg('Web URL Required!');
        return;
    }
    // show loading animation
    showLoader();
    // validate bookmark with checkBookmark function
    bookmark = checkBookmark(bookmark)[0];
    const url = encodeURIComponent(bookmark);
    // function for scraping url using https://opengraph.io  API
    getUrl(url, bookmark);
    // unzoom floater
    closeFloater();
}

// fill the screen with bookmarks using map method. map parameters are bookmark and id for close icon
function fillBookmarksList(bookmarks = []) {
    const bookmarksHtml = bookmarks.map((bookmark, id) => `<div class="card" id="${id}"><a class="bookmark" href="${bookmark.url}" target="_blank">\n        <img class = "img" src="${bookmark.image}">\n        <div class = "title">${bookmark.title}</div>\n        </a><div class="loader1" id="loader${id}"></div><div class="edit-input"><form><input type="text" value="${bookmark.url}"><button type="submit" class="edit-icon-ok" data-id="${id}">&#10004;</button></form><span class="edit-icon-close" data-id="${id}">&#10006;</span></div><div class="close tooltip"><span class="icon" data-id="${id}">&#128465;</span><span class="tooltiptext">Remove Bookmark?</span></div><div class="edit tooltip"><span class="edit-icon" data-id="${id}">&#128397;</span><span class="tooltipedit">Edit Bookmark?</span></div></div>`).join(" ");
    output.innerHTML = bookmarksHtml;
    lessCards();
}

// fill edited bookmark
function fillBookmark(bookmark, id) {
    const card = document.getElementById(id);
    card.innerHTML = `<a class="bookmark" href="${bookmark.url}" target="_blank">\n        <img class = "img" src="${bookmark.image}">\n        <div class = "title">${bookmark.title}</div>\n        </a><div class="loader1" id="loader${id}"></div><div class="edit-input"><form><input type="text" value="${bookmark.url}"><button type="submit" class="edit-icon-ok" data-id="${id}">&#10004;</button></form><span class="edit-icon-close" data-id="${id}">&#10006;</span></div><div class="close tooltip"><span class="icon" data-id="${id}">&#128465;</span><span class="tooltiptext">Remove Bookmark?</span></div><div class="edit tooltip"><span class="edit-icon" data-id="${id}">&#128397;</span><span class="tooltipedit">Edit Bookmark?</span></div>`;
}

// remove bookmark from screen and local storage
function removeBookmark(e) {
    // check if mouse target is close icon
    if (!e.target.matches(".icon")) return;
    // confirm window
    const answer = confirm("Are you sure?");
    if (!answer) return;
    // pass the id value to index
    const index = e.target.dataset.id;
    // remove bookmark using splice method
    bookmarks.splice(index, 1);
    fillBookmarksList(bookmarks);
    storeBookmarks(bookmarks);
}

// edit bookmark function
function editBookmark(e) {
    const editIcon = e.target;
    // const bookmark = editIcon.parentElement.previousElementSibling.previousElementSibling.previousElementSibling;
    if (!e.target.matches(".edit-icon")) return;
    const editInput = e.target.parentElement.previousElementSibling.previousElementSibling;
    if (editIcon) {
        editInput.classList.toggle('show-edit-input');
    }
    const editForm = editInput.firstElementChild;
    // add event listener / submit edited bookmark
    editForm.addEventListener('submit', changeBookmark);
    e.preventDefault()
}

// close bookmark editing field
function closeEdit(e) {
    if (!e.target.matches('.edit-icon-close')) return;
    // remove input field
    const editInput = e.target.parentElement;
    editInput.classList.remove('show-edit-input');
    e.preventDefault()
}

// Change bookmark
function changeBookmark(e) {
    if (!e.target.matches('form')) return;
    // get input value
    let input = e.target.firstElementChild.value;
    // get id
    const id = e.target.lastElementChild.dataset.id;
    // validate url
    input = checkBookmark(input)[0];
    const url = encodeURIComponent(input);
    // show loading animation
    showLoader1(id);
    //  function for scraping edited url using https://opengraph.io 
    getEditedUrl(url, id, input);
    // remove input field
    const editInput = e.target.parentElement;
    editInput.classList.remove('show-edit-input');
    e.preventDefault()
}

// Store bookmarks in local storage
function storeBookmarks(bookmarks = []) {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks))
}

// less cards in row for bigger screens
function lessCards() {
    const countCard = output.childElementCount;
    countCard <= 36 ? output.classList.add('less-cards') : output.classList.remove('less-cards')
}

// event listeners
floater.addEventListener("mouseenter", showFloater), floater.addEventListener("click", showFloater), overlay.addEventListener("click", closeFloater), floater.addEventListener("mouseleave", closeFloater), bookmarkForm.addEventListener("submit", showBookmark), output.addEventListener("click", removeBookmark), output.addEventListener('click', editBookmark), output.addEventListener('click', closeEdit), fillBookmarksList(bookmarks);
output.addEventListener('mouseover', (event) => {
    if (event.target.classList.contains('img')) {
        let newimg = event.target;
        newimg.classList.add('big-img');
        newimg.parentElement.parentElement.style.zIndex = "3"
    };
});
output.addEventListener('mouseout', (event) => {
    if (event.target.classList.contains('img')) {
        let newimg = event.target;
        newimg.classList.remove('big-img');
        document.querySelector(".card").classList.remove('card-hover');
        newimg.parentElement.parentElement.style.zIndex = "0"
    }
});