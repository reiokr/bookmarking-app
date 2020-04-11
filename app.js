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
    loader.classList.add("show-loader"), addBtn.classList.add("hide-floater"), input.classList.add("hide-floater")
}

// hide loader image
function removeLoader() {
    loader.classList.remove("show-loader"), addBtn.classList.remove("hide-floater"), input.classList.remove("hide-floater")
}

// show error message
function errorMsg(msg) {
    if (floaterTop.classList.contains('msg'))return;
    else {
        errMsg = document.createElement('p');
        errMsg.className = ('err-msg');
        errMsg.innerText = msg;
        floaterTop.appendChild(errMsg);
        floaterTop.classList.add('msg')
    }
        setTimeout(() => {
            errMsg.remove();
            floaterTop.classList.remove('msg')
        }, 5000)
}

// create new bookmark
function showBookmark(e) {
    e.preventDefault();
    //check if input value is empty string
    if (!input.value) {
        errorMsg('Field is empty! Valid web address needed');
        return;
    }
    showLoader();

    let bookmark = input.value;

    // check if input has http:// and if not then append
    /^https?:\/\//i.test(bookmark) || (bookmark = `http://${bookmark}`);

    // check if youtube video ends ?t=[digits] or &t=[digits]
    
    // ret = /[0-9]{1,}$/;
    // let time = ret.exec(bookmark)[0];
    // console.log(time);

    

    re = /[\?&]t=[0-9]{1,}$/;
    let urlEnd;
    let videoStart;
    if (!re.test(bookmark)) {
        console.log(`${bookmark} does not contain ${re.source}`);
        urlEnd = "";
        videoStart ="";
    } else {
        console.log(`${bookmark} contains ${re.source}`);
        urlEnd = re.exec(bookmark)[0];
        let time = urlEnd.replace(/[\?&]t=/, '');

        videoStart = `<br><p class="video-start">Video start at ${time} s</p>`;
    };

    const url = encodeURIComponent(bookmark);

    // fetch site info from https://opengraph.io/api/1.1/site
    fetch(`${apiUrl}/${url}?app_id=${appId}`)
        .then(response => response.json())
        .then(data => {
            const bookmark = {
                title: data.hybridGraph.title + videoStart,
                image: data.hybridGraph.image,
                url: data.hybridGraph.url + urlEnd
            };
            // check if input is YouTube video and replace www.youtube.com/watch?v= to youtu.be/
            let youtubeUrl = bookmark.url;
            let yt = /www\.youtube\.com\/watch\?v=/i;
            let newUrl;
            if (!yt.test(youtubeUrl)) {} else {
                let newString = yt.exec(youtubeUrl);
                newUrl = youtubeUrl.replace(newString[0], 'youtu.be/');
                bookmark.url = newUrl;
            }

            // check if in youtube url ?list has changed to &list and change it back
            let youtubeUrlnew = bookmark.url
            let andUrl;
            let and = /&list/;
            if (!and.test(youtubeUrlnew)) {
                console.log('does not contain &list')
            } else {
                let newString = and.exec(youtubeUrlnew);
                andUrl = youtubeUrlnew.replace(newString[0], '?list');
                console.log(`${youtubeUrlnew} contains ${and.source}`)
                bookmark.url = andUrl;
            }

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
            // handle fetch error
        }).catch(error => {
            console.log(error);
            errorMsg("We can't find what you are looking!");
            removeLoader();
        });
    // unzoom floater
    closeFloater()
}

// fill the screen with bookmarks using map method. map parameters are bookmark and id for close icon
function fillBookmarksList(bookmarks = []) {

    const bookmarksHtml = bookmarks.map((bookmark, id) => `<a class="bookmark" href="${bookmark.url}" target="_blank">\n        <div><img class = "img" src="${bookmark.image}"></div>\n        <div class = "title">${bookmark.title}</div>\n        </a><div class="close"><span class="icon" data-id="${id}">✖</span> </div> `).join(" ");
    output.innerHTML = bookmarksHtml;
}

// function- remove bookmark from screen and local storage
function removeBookmark(e) {
    // check if mouse target is close icon
    if (!e.target.matches(".icon")) return;

    // pass the id value to index
    const index = e.target.dataset.id;

    // remove bookmark using splice method
    bookmarks.splice(index, 1);

    fillBookmarksList(bookmarks);
    storeBookmarks(bookmarks);
}
// function for stoeing data in local storage
function storeBookmarks(bookmarks = []) {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks))
}

// event listeners
floater.addEventListener("mouseenter", showFloater), floater.addEventListener("click", showFloater), overlay.addEventListener("click", closeFloater), floater.addEventListener("mouseleave", closeFloater), bookmarkForm.addEventListener("submit", showBookmark), output.addEventListener("click", removeBookmark), fillBookmarksList(bookmarks);