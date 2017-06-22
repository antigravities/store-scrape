var games = [],
    parser = new DOMParser(),
    waitingRequest = 0;

Array.prototype.slice.call(document.getElementsByClassName("search_result_row")).forEach(function (v) {
    if (v.getElementsByClassName("search_discount").length > 0 && v.getElementsByClassName("search_discount")[0].innerText.trim() != "") {
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
        ]

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
        xhr.open('GET', link, true);
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var response = parser.parseFromString(xhr.responseText, "text/html"),
                    cards = false;
                try {
                    var children = response.getElementById('category_block').children;
                    for (var i = 0, l = children.length; i < l; i++) {
                        if (children[i].children[1].innerText === "Steam Trading Cards") {
                            cards = true;
                            break;
                        }
                    }
                    game.push(cards ? "YES" : "NO");
                } catch (e) {
                    game.push("?");
                }
                try {
                    game.push(response.getElementsByClassName("dynamic_bundle_description").length > 0 ? "YES" : "NO");
                } catch (e) {
                    game.push("?");
                }
                game.push(link);
                games.push(game.join("\t"));
                waitingRequest--;
            } else if(this.readyState === 4) {
                game.push("?");
                game.push("?");
                game.push(link);
                games.push(game.join("\t"));
                xhr.abort();
                waitingRequest--;
            }
        }
        xhr.send();
        waitingRequest++;
    }
});

var timer = setInterval(function () {
    if(waitingRequest === 0){
        clearInterval(timer);
        console.log(games.join("\n"));
    }
}, 100);
