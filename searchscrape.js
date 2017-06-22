var games = [];

Array.prototype.slice.call(document.getElementsByClassName("search_result_row")).forEach(function(v){
	if( v.getElementsByClassName("search_discount").length > 0 && v.getElementsByClassName("search_discount")[0].innerText.trim() != "" ) {
		var game = [
			//document.getElementsByClassName("searchtag tag_dynamic")[0].children[0].innerText,
			v.getElementsByClassName("title")[0].innerText.trim(),
			v.getElementsByClassName("search_discount")[0].innerText.slice(1).trim(),
			v.getElementsByClassName("search_price discounted")[0].children[0].innerText,
			v.getElementsByClassName("search_price discounted")[0].innerText.split("\n")[1].trim(),
		]

		try {
			var rating = v.getElementsByClassName("search_review_summary")[0].getAttribute("data-store-tooltip").split("<br>")[0].split(" ");
			var r2 = "";
			rating.forEach(function(v){
				r2+=v[0];
			});
			game.push(r2);
		} catch(e){
			game.push("NA");
		}

		game.push(v.getElementsByClassName("mac").length > 0 ? "YES" : "NO");
		game.push(v.getElementsByClassName("windows").length > 0 ? "YES" : "NO");
		game.push(v.getElementsByClassName("linux").length > 0 ? "YES" : "NO");

		game.push(( v.getElementsByClassName("oculusrift").length > 0 || v.getElementsByClassName("htcvive").length > 0 || v.getElementsByTagName("razerosvr").length > 0 ) ? "YES" : "NO" );

		game.push("https://store.steampowered.com/app/" + v.getAttribute("data-ds-appid"));

		games.push(game.join("\t"));
	}
});

console.log(games.join("\n"));