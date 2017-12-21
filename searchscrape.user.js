// ==UserScript==
// @name         Store Scrape
// @namespace    http://alexandra.moe/
// @version      0.1.0.1
// @description  Format data from Steam Store pages into spreadsheet-pastable text blobs.
// @author       antigravities && C.roe
// @match        http://store.steampowered.com/search/*
// @grant        unsafeWindow
// @run-at       document-body
// @updateURL    https://raw.githubusercontent.com/antigravities/store-scrape/master/searchscrape.user.js
// ==/UserScript==

function scr(){
    var games = [],
        parser = new DOMParser(),
        waitingRequest = 0,
        totalRequest = document.getElementsByClassName("search_result_row").length;

    Array.prototype.slice.call(document.getElementsByClassName("search_result_row")).forEach(function (v) {
        if (v.getAttribute('data-ds-packageid') === null && v.getAttribute('data-ds-bundleid') === null)
            if (v.getElementsByClassName("search_discount").length > 0 && v.getElementsByClassName("search_discount")[0].innerText.trim() !== "") {
                var releasedate;
                try {
                    releasedate = new Date(v.getElementsByClassName("search_released")[0].innerText.trim());
                    releasedate = (releasedate.getMonth() + 1) + "/" + releasedate.getDate() + "/" + releasedate.getFullYear();
                } catch (e) {
                    releasedate = v.getElementsByClassName("search_released")[0].innerText.trim();
                }

                var game = [
                    //document.getElementsByClassName("searchtag tag_dynamic")[0].children[0].innerText,
                    v.getElementsByClassName("title")[0].innerText.trim(),
                    v.getElementsByClassName("search_discount")[0].innerText.slice(1).trim(),
                    v.getElementsByClassName("search_price discounted")[0].children[0].innerText,
                    v.getElementsByClassName("search_price discounted")[0].innerText.split("\n")[1].trim(),
                    releasedate
                ];

                try {
                    var rating = v.getElementsByClassName("search_review_summary")[0].getAttribute("data-store-tooltip").split("<br>")[0].split(" ");
                    var r2 = "";
                    rating.forEach(function (v) {
                        r2 += v[0];
                    });
                    game.push(r2);
                } catch (e) {
                    game.push("NA");
                }

                game.push(v.getElementsByClassName("win").length > 0 ? "YES" : "NO");
                game.push(v.getElementsByClassName("mac").length > 0 ? "YES" : "NO");
                game.push(v.getElementsByClassName("linux").length > 0 ? "YES" : "NO");

                game.push(( v.getElementsByClassName("oculusrift").length > 0 || v.getElementsByClassName("htcvive").length > 0 || v.getElementsByTagName("razerosvr").length > 0 ) ? "YES" : "NO");


                var link = "http://store.steampowered.com/app/" + v.getAttribute("data-ds-appid"),
                    xhr = new XMLHttpRequest();
                xhr.open('GET', "http://store.steampowered.com/api/appdetails?appids=" + v.getAttribute("data-ds-appid") + "&cc=us&l=english", true);
                xhr.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        var json = JSON.parse(xhr.responseText),
                            cards = false;
                        try {
                            game[1] = json[v.getAttribute("data-ds-appid")].data.price_overview.discount_percent + "%";
                            game[2] = "$" + (json[v.getAttribute("data-ds-appid")].data.price_overview.initial / 100);
                            game[3] = "$" + (json[v.getAttribute("data-ds-appid")].data.price_overview.final/ 100);
                            json[v.getAttribute("data-ds-appid")].data.categories.forEach(function (categorie) {
                                if(categorie.id === 29)
                                    cards = true;
                            });
                            game.push(cards ? "YES" : "NO");
                        } catch (e) {
                            game.push("?");
                        }
                        try {
                            if(json[v.getAttribute("data-ds-appid")].data.packages)
                                game.push("YES");
                            else
                                game.push("NO");
                        } catch (e) {
                            game.push("?");
                        }
                        game.push(link);
                        games.push(game.join("\t"));
                        waitingRequest--;
                    } else if (this.readyState === 4) {
                        game.push("?");
                        game.push("?");
                        game.push(link);
                        games.push(game.join("\t"));
                        xhr.abort();
                        waitingRequest--;
                    }
                };
                xhr.send();
                waitingRequest++;
            }
    });

    var timer = setInterval(function () {
            if (waitingRequest === 0) {
                dialog.Dismiss();
                clearInterval(timer);
                if (games.length === 0) {
                    ShowAlertDialog("Error", "Couldn't find any discounted games. Please make sure that you're on /search/ page with discounted games on it");
                } else {
                    ShowPromptWithTextAreaDialog("Done!", games.join("\n"), "", "", 9999999);

                    var instructions = document.createElement("div");
                    instructions.innerHTML = "<b>Copy and paste</b> the following into the Google Docs spreadsheet. <a href='#' onClick=\"document.getElementsByClassName('newmodal_prompt_textarea')[0].select(); document.execCommand('copy'); this.innerHTML = 'Copied!'; return false;\">Copy</a>";

                    var ta = document.getElementsByClassName("newmodal_prompt_textarea")[0].parentElement.parentElement;
                    ta.insertBefore(instructions, ta.children[0]);
                }
            } else {

                var bundles = (totalRequest - waitingRequest),
                    message = "Fetching progress: " + (totalRequest - waitingRequest - bundles) + " / " + (totalRequest - bundles);
                if (lastMessage !== message) {
                    document.getElementById("scr_message").innerHTML = message;
                    lastMessage = message;
                }
            }
        }, 100),
        lastMessage = "";

    dialog = ShowBlockingWaitDialog("Fetching game information, this may take a while...", "<div id='scr_message'></div>");
}

unsafeWindow.addEventListener("load", function(){
    var col = document.getElementsByClassName("rightcol")[0];
    var div = document.createElement("div");
    div.innerHTML = "<a class='btnv6_blue_hoverfade btn_medium'><span>Store Scrape</span></a><br><br><br>";
    div.addEventListener("click", scr);
    col.insertBefore(div, col.children[0]);
});
