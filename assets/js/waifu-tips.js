/*
 * https://imjad.cn/archives/lab/add-dynamic-poster-girl-with-live2d-to-your-blog-02
 * https://www.fghrsh.net/post/123.html
 */
console.log("load waifu-tips.js------")

function loadWidget(waifuPath, apiPath) {
	localStorage.removeItem("waifu-display");
	sessionStorage.removeItem("waifu-text");
	$("body").append(`<div id="waifu" style="z-index: 1030;">
			<div id="waifu-tips"></div>
			<canvas id="live2d" width="300" height="300"></canvas>
			<div id="waifu-tool">
				<span class="fa fa-lg fa-arrow-up"></span>
				<span class="fa fa-lg fa-comment"></span>
				<span class="fa fa-lg fa-paper-plane"></span>
				<span class="fa fa-lg fa-street-view"></span>
				<span class="fa fa-lg fa-camera-retro"></span>
				<span class="fa fa-lg fa-info-circle"></span>
				<span class="fa fa-lg fa-times"></span>
			</div>
		</div>`);
	$("#waifu").show().animate({ bottom: -12 }, 3000);

	function registerEventListener() {
		$("#waifu-tool .fa-arrow-up").click(() => {
			sweetScroller.to(0)
		});
		$("#waifu-tool .fa-comment").click(showHitokoto);
		$("#waifu-tool .fa-paper-plane").click(() => {
			if (window.Asteroids) {
				if (!window.ASTEROIDSPLAYERS) window.ASTEROIDSPLAYERS = [];
				window.ASTEROIDSPLAYERS.push(new Asteroids());
			} else {
				$.ajax({
					url: "https://cdn.jsdelivr.net/gh/GalaxyMimi/CDN/asteroids.js",
					dataType: "script",
					cache: true
				});
			}
		});
		$("#waifu-tool .fa-street-view").click(loadRandModel);
		$("#waifu-tool .fa-camera-retro").click(() => {
			showMessage("照好了嘛，可爱吧？嘻嘻~", 6000, 9);
			Live2D.captureName = "photo.png";
			Live2D.captureFrame = true;
		});
		$("#waifu-tool .fa-info-circle").click(() => {
			open("https://github.com/stevenjoezhang/live2d-widget");
		});
		$("#waifu-tool .fa-times").click(() => {
			localStorage.setItem("waifu-display", new Date().getTime());
			showMessage("回见喽，拜拜~", 2000, 11);
			$("#waifu").animate({ bottom: -500 }, 3000, () => {
				$("#waifu").hide();
				$("#waifu-toggle").show().animate({ "margin-left": -50 }, 1000);
			});
		});
		var re = /x/;
		console.log(re);
		re.toString = () => {
			showMessage("哈哈，你打开了控制台，是想要看看我的小秘密吗？", 6000, 9);
			return "";
		};
		$(document).on("copy", () => {
			showMessage("你都复制了些什么呀，转载要记得加上出处哦！", 6000, 9);
		});
		$(document).on("visibilitychange", () => {
			if (!document.hidden) showMessage("哇，你终于回来了～", 6000, 9);
		});
	}
	registerEventListener();

	function welcomeMessage() {
		var SiteIndexUrl = location.port ? `${location.protocol}//${location.hostname}:${location.port}/` : `${location.protocol}//${location.hostname}/`, text; //自动获取主页
		if (location.href == SiteIndexUrl) { //如果是主页
			var now = new Date().getHours();
			if (now > 5 && now <= 7) text = "早安！一日之计在于晨，美好的一天就要开始喽！";
			else if (now > 7 && now <= 11) text = "上午好！工作顺利吗？不要久坐，多起来走动走动哦！";
			else if (now > 11 && now <= 14) text = "工作了一个上午，午餐时间到喽！";
			else if (now > 14 && now <= 17) text = "午后很容易犯困呢，要劳逸结合哦！";
			else if (now > 17 && now <= 19) text = "傍晚了！好想去吃好吃的！";
			else if (now > 19 && now <= 21) text = "晚上好，今天的工作都快忙完了吧，嘻嘻~";
			else if (now > 21 && now <= 23) text = ["已经这么晚了呀，早点休息吧，晚安~", "深夜了，休息一下眼睛吧~"];
			else text = "都这么晚了鸭，我也不要睡觉，想陪你熬夜~";
		} else if (document.referrer !== "") {
			var referrer = document.createElement("a");
			referrer.href = document.referrer;
			var domain = referrer.hostname.split(".")[1];
			if (location.hostname == referrer.hostname) text = `欢迎阅读<span style="color:#0099cc;">『${document.title.split(" - ")[0]}』</span>`;
			else if (domain == "baidu") text = `Hello！来自 百度搜索 的朋友<br>你是搜索 <span style="color:#0099cc;">${referrer.search.split("&wd=")[1].split("&")[0]}</span> 找到的我吗？`;
			else if (domain == "so") text = `Hello！来自 360搜索 的朋友<br>你是搜索 <span style="color:#0099cc;">${referrer.search.split("&q=")[1].split("&")[0]}</span> 找到的我吗？`;
			else if (domain == "google") text = `Hello！来自 谷歌搜索 的朋友<br>欢迎阅读<span style="color:#0099cc;">『${document.title.split(" - ")[0]}』</span>`;
			else text = `Hello！来自 <span style="color:#0099cc;">${referrer.hostname}</span> 的朋友`;
		} else {
			text = `欢迎阅读<span style="color:#0099cc;">『${document.title.split(" - ")[0]}』</span>`;
		}
		showMessage(text, 7000, 8);
	} welcomeMessage();

	//检测用户活动状态，并在空闲时定时显示一言
	var userAction = false,
		hitokotoTimer = null,
		messageTimer = null,
		messageArray = ["好久不见啦~", "坏蛋，不陪我玩儿的大坏蛋！哼~", "嗨～一起来玩儿吧！", "小拳拳锤你胸口！"];
	if ($(".fa-share-alt").is(":hidden")) messageArray.push("记得把小家加入Adblock白名单哦！");
	$(document).mousemove(() => {
		userAction = true;
	}).keydown(() => {
		userAction = true;
	});
	setInterval(() => {
		if (!userAction) {
			if (!hitokotoTimer) hitokotoTimer = setInterval(showHitokoto, 25000);
		} else {
			userAction = false;
			clearInterval(hitokotoTimer);
			hitokotoTimer = null;
		}
	}, 1000);

	function showHitokoto() {
		if (Math.random() < 0.6 && messageArray.length > 0) showMessage(messageArray[Math.floor(Math.random() * messageArray.length)], 6000, 9);
		else $.getJSON("/assets/motto.json", function(result) {
			showMessage(result.text[Math.floor(Math.random() * result.text.length)], 6000, 9);
		});
	}

	function showMessage(text, timeout, priority) {
		if (!text) return;
		if (!sessionStorage.getItem("waifu-text") || sessionStorage.getItem("waifu-text") <= priority) {
			if (messageTimer) {
				clearTimeout(messageTimer);
				messageTimer = null;
			}
			if (Array.isArray(text)) text = text[Math.floor(Math.random() * text.length)];
			sessionStorage.setItem("waifu-text", priority);
			$("#waifu-tips").stop().html(text).fadeTo(200, 1);
			messageTimer = setTimeout(() => {
				sessionStorage.removeItem("waifu-text");
				$("#waifu-tips").fadeTo(1000, 0);
			}, timeout);
		}
	}

	function initModel() {
		var modelId = localStorage.getItem("modelId"),
			modelTexturesId = localStorage.getItem("modelTexturesId");
		if (modelId == null) {
			//首次访问加载 指定模型 的 指定材质
			var modelId = 1, //模型 ID
				modelTexturesId = 53; //材质 ID
		}
		loadModel(modelId, modelTexturesId);
		$.getJSON(waifuPath, function(result) {
			$.each(result.mouseover, function(index, tips) {
				$(document).on("mouseover", tips.selector, function() {
					var text = Array.isArray(tips.text) ? tips.text[Math.floor(Math.random() * tips.text.length)] : tips.text;
					text = text.replace("{text}", $(this).text());
					showMessage(text, 4000, 8);
				});
			});
			$.each(result.click, function(index, tips) {
				$(document).on("click", tips.selector, function() {
					var text = Array.isArray(tips.text) ? tips.text[Math.floor(Math.random() * tips.text.length)] : tips.text;
					text = text.replace("{text}", $(this).text());
					showMessage(text, 4000, 8);
				});
			});
			$.each(result.seasons, function(index, tips) {
				var now = new Date(),
					after = tips.date.split("-")[0],
					before = tips.date.split("-")[1] || after;
				if ((after.split("/")[0] <= now.getMonth() + 1 && now.getMonth() + 1 <= before.split("/")[0]) && (after.split("/")[1] <= now.getDate() && now.getDate() <= before.split("/")[1])) {
					var text = Array.isArray(tips.text) ? tips.text[Math.floor(Math.random() * tips.text.length)] : tips.text;
					text = text.replace("{year}", now.getFullYear());
					//showMessage(text, 7000, true);
					messageArray.push(text);
				}
			});
		});
	}
	initModel();

	function loadModel(modelId, modelTexturesId) {
		localStorage.setItem("modelId", modelId);
		if (modelTexturesId === undefined) modelTexturesId = 0;
		localStorage.setItem("modelTexturesId", modelTexturesId);
		loadlive2d("live2d", `${apiPath}/get/?id=${modelId}-${modelTexturesId}`, console.log(`Live2D 模型 ${modelId}-${modelTexturesId} 加载完成`));
	}

	function loadRandModel() {
		var modelId = localStorage.getItem("modelId"),
			modelTexturesId = localStorage.getItem("modelTexturesId");
			//可选 "rand"(随机), "switch"(顺序)
		$.ajax({
			cache: false,
			url: `${apiPath}/rand_textures/?id=${modelId}-${modelTexturesId}`,
			dataType: "json",
			success: function(result) {
				if (result.textures["id"] == 1 && (modelTexturesId == 1 || modelTexturesId == 0)) showMessage("我还没有其他衣服呢！", 4000, 10);
				else showMessage("我的新衣服好看嘛？", 4000, 10);
				loadModel(modelId, result.textures["id"]);
			}
		});
	}
}

function initWidget(waifuPath = "/waifu-tips.json", apiPath = "") {
	if (screen.width <= 1200) return;
	$("body").append(`<div id="waifu-toggle" style="margin-left: -100px;">
			<span>看板娘</span>
		</div>`);
	$("#waifu-toggle").hover(() => {
		$("#waifu-toggle").animate({ "margin-left": -30 }, 500);
	}, () => {
		$("#waifu-toggle").animate({ "margin-left": -50 }, 500);
	}).click(() => {
		$("#waifu-toggle").animate({ "margin-left": -100 }, 1000, () => {
			$("#waifu-toggle").hide();
		});
		if ($("#waifu-toggle").attr("first-time")) {
			loadWidget(waifuPath, apiPath);
			$("#waifu-toggle").attr("first-time", false);
		} else {
			localStorage.removeItem("waifu-display");
			$("#waifu").show().animate({ bottom: -12 }, 3000);
		}
	});
	if (localStorage.getItem("waifu-display") && new Date().getTime() - localStorage.getItem("waifu-display") <= 86400000) {
		$("#waifu-toggle").attr("first-time", true).css({ "margin-left": -50 });
	} else {
		loadWidget(waifuPath, apiPath);
	}
}
