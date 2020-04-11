const body=document.body,input=document.querySelector("input[type=text]"),overlay=document.querySelector(".overlay"),floater=document.querySelector(".floater"),floaterTop=document.querySelector(".floater-top"),addBtn=document.querySelector('[name="add"]'),output=document.querySelector(".output"),bookmarkForm=document.querySelector(".bookmark-form"),loader=document.querySelector(".loader"),bookmarks=JSON.parse(localStorage.getItem("bookmarks"))||[],apiUrl="https://opengraph.io/api/1.1/site",appId="58858c7bcf07b61e64257391";function showFloater(){body.classList.add("show-floater")}function closeFloater(){body.classList.contains("show-floater")&&body.classList.remove("show-floater")}function showLoader(){loader.classList.add("show-loader"),addBtn.classList.add("hide-floater"),input.classList.add("hide-floater")}function removeLoader(){loader.classList.remove("show-loader"),addBtn.classList.remove("hide-floater"),input.classList.remove("hide-floater")}function errorMsg(e){floaterTop.classList.contains("msg")||(errMsg=document.createElement("p"),errMsg.className="err-msg",errMsg.innerText=e,floaterTop.appendChild(errMsg),floaterTop.classList.add("msg"),setTimeout(()=>{errMsg.remove(),floaterTop.classList.remove("msg")},5e3))}var toHHMMSS=e=>{var o=parseInt(e,10);return[Math.floor(o/3600),Math.floor(o/60)%60,o%60].map(e=>e<10?"0"+e:e).filter((e,o)=>"00"!==e||o>0).join(":")};function showBookmark(e){if(e.preventDefault(),!input.value)return void errorMsg("Field is empty! Valid web address needed");showLoader();let o,t,r=input.value;if(/^https?:\/\//i.test(r)||(r=`http://${r}`),re=/[\?&]t=[0-9]{1,}$/,re.test(r)){console.log(`${r} contains ${re.source}`),o=re.exec(r)[0];let e=toHHMMSS(o.replace(/[\?&]t=/,""));t=`<br><p class="video-start">Video start at ${e}</p>`}else console.log(`${r} does not contain ${re.source}`),o="",t="";const a=encodeURIComponent(r);fetch(`${apiUrl}/${a}?app_id=${appId}`).then(e=>e.json()).then(e=>{const r={title:e.hybridGraph.title+t,image:e.hybridGraph.image,url:e.hybridGraph.url+o};let a,s=r.url,l=/www\.youtube\.com\/watch\?v=/i;if(l.test(s)){let e=l.exec(s);a=s.replace(e[0],"youtu.be/"),r.url=a}else;let i,n=r.url,c=/&list/;if(c.test(n)){let e=c.exec(n);i=n.replace(e[0],"?list"),console.log(`${n} contains ${c.source}`),r.url=i}else console.log("does not contain &list");bookmarks.push(r),fillBookmarksList(bookmarks),storeBookmarks(bookmarks),bookmarkForm.reset(),removeLoader()}).catch(e=>{console.log(e),errorMsg("We can't find what you are looking!"),removeLoader()}),closeFloater()}function fillBookmarksList(e=[]){const o=e.map((e,o)=>`<a class="bookmark" href="${e.url}" target="_blank">\n        <div><img class = "img" src="${e.image}"></div>\n        <div class = "title">${e.title}</div>\n        </a><div class="close"><span class="icon" data-id="${o}">✖</span> </div> `).join(" ");output.innerHTML=o}function removeBookmark(e){if(!e.target.matches(".icon"))return;const o=e.target.dataset.id;bookmarks.splice(o,1),fillBookmarksList(bookmarks),storeBookmarks(bookmarks)}function storeBookmarks(e=[]){localStorage.setItem("bookmarks",JSON.stringify(e))}floater.addEventListener("mouseenter",showFloater),floater.addEventListener("click",showFloater),overlay.addEventListener("click",closeFloater),floater.addEventListener("mouseleave",closeFloater),bookmarkForm.addEventListener("submit",showBookmark),output.addEventListener("click",removeBookmark),fillBookmarksList(bookmarks);