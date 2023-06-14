$(function () {

    var playerContent1 = $('#player-content1'); // 歌曲信息模块部分dom元素
    var playerContent2 = $('#player-content2'); // 控制模块
    var musicName = $('.music-name'); // 歌曲名部分dom元素 
    var artistName = $('.artist-name'); // 歌手名部分dom元素

    var musicImgs = $('.music-imgs'); // 左侧封面图dom元素

    var playPauseBtn = $('.play-pause'); // 播放/暂停按钮 dom元素
    var playPrevBtn = $('.prev'); // 上一首按钮 dom元素
    var playNextBtn = $('.next') // 下一首按钮 dom元素

    var time = $('.time'); // 时间信息部分 dom元素
    var tProgress = $('.current-time'); // 当前播放时间文本部分 dom元素
    var totalTime = $('.total-time'); // 歌曲总时长文本部分 dom元素

    var sArea = $('#s-area'); // 进度条部分
    var insTime = $('#ins-time'); // 鼠标移动至进度条上面，显示的信息部分
    var sHover = $('#s-hover'); // 鼠标移动至进度条上面，前面变暗的进度条部分
    var seekBar = $('#seek-bar'); // 播放进度条部分

    // 一些计算所需的变量
    var seekT, seekLoc, seekBarPos, cM, ctMinutes, ctSeconds, curMinutes, curSeconds, durMinutes, durSeconds, playProgress, bTime, nTime = 0
    var musicImgsData = [] // 图片地址数组
    var musicNameData = []; // 歌曲名数组
    var artistNameData = [] // 创作歌手数组
    var musicUrls = []; // 歌曲mp3数组
    var lyricSet = []; // 歌词数组
    var musicMp4SrcSet = []; // mp4地址保存
    var currIndex = -1; // 当前播放索引

    var buffInterval = null // 初始化定时器 判断是否需要缓冲
    var len = musicNameData.length; // 歌曲列表长度

    // 获取musicFeatureList音乐搜索展示的列表距离窗口顶部的距离
    // 优化在页面大小发生改变时，更新这个值
    var musicListNav = $('.musicListNav');

    // 获取用户输入的值（歌手名）
    var SingerNameIpt = $("#key")
    // 歌手名
    var SingerName = '';
    // 播放全部按钮
    let playerAll = $('#playerAll');
    var searchMusicSet = [] //保存搜索歌曲的内容
    // 用来判断 是否显示player
    let isExpanded = true
    //搜索按钮
    let searchMusic = $("#searchMusic");
    var pagination = $('.pagination') //分页
    var playerShow = $('.player-show') //是否展示控件按钮
    var player = $("#player") //控件主题
    // 歌词展示
    let plyricShowContent = $('#player-content2 .plyricShowContent')
    // mp4播放
    let mp4Show = $("#mp4Show")
    let mp4ShowDiv = $("#mp4Show>div")
    let myVideo = $('<video></video>');
    let showVideoBtn = $("#showVideoBtn")
    let mp4CloseBtn = $("#mp4Show .mp4CloseBtn")
    //搜索功能
    function playsearch(n) {
        // 获取输入框的歌手名
        SingerName = SingerNameIpt.val().trim();
        let pattern = /^[a-zA-Z0-9\u4e00-\u9fa5]+(?<!\s)$/

        //清空之前，保存的音乐数据
        searchMusicSet = []
        if (pattern.test(SingerName)) {
            $.getJSON("http://www.lifan.ink:9090/search", {
                "key": SingerName,
                "pn": n
            }, function (data) {
                $("#musicListTable tbody").empty();
                //获取json数据中list数组
                var list = data.data.list;
                var str = "";
                for (var i = 0; i < list.length; i++) {
                    // rid
                    var rid = list[i].rid;
                    // 图片
                    var pic = list[i].pic120;
                    // 歌曲名
                    var name = list[i].name;
                    var showName = name.length <= 12 ? name : name.slice(0, 12) + '...';
                    // 歌手名
                    var artist = list[i].artist;
                    var showArtist = artist.length <= 12 ? artist : artist.slice(0, 12) + '...';
                    // 专辑
                    var album = list[i].album;
                    // 播放时长
                    var songTimeMinutes = list[i].songTimeMinutes;
                    // 音乐对象
                    var musicObject = {
                        rid,
                        pic,
                        name,
                        artist,
                        album,
                        songTimeMinutes
                    }
                    //将每个音乐对象保存到 保存搜索音乐的数组
                    searchMusicSet.push(musicObject)
                    str += `<tr>
                        <td class="hidden-sm hidden-xs">${i + 1}</td>
                        <td>${showName} <div class="pull-right down-play">
                                <i id="musicPlayBtn${i}" class="glyphicon glyphicon-play"></i>
                                <i id="musicAddBtn${i}" class="glyphicon glyphicon-plus"> </i>
                                <i id = "musicdownloadBtn${i}" class = "glyphicon glyphicon-save"></i>
                            </div>
                        </td>
                        <td>${showArtist}</td>
                        <td class="hidden-sm hidden-xs">${album}</td>
                        <td>${songTimeMinutes}</td>
                    </tr>`;

                }
                //音乐搜索展示列表
                // replace(/(?<=\>)\s+|\s+(?=<)|\n/g, '')
                const newStr = str.replace(/(?<=\>)\s+|\s+(?=<)|\n/g, "");
                // console.log(newStr);
                $("#musicListTable").append(newStr);
            });
        }
        // 点击搜索后 将页面移到 显示列表
        $('html, body').animate({
            scrollTop: musicListNav.offset().top - 50
        }, 1000); // 在 1000 毫秒内平滑地滚动到指定元素
    }

    //通过rid获取歌曲的资源地址
    function getMusicSrc(rid) {
        var result;
        $.ajax({
            url: 'http://www.lifan.ink:9090/mp3',
            data: {
                "rid": rid
            },
            type: 'GET',
            async: false, // 将async选项设置为false，表示请求是同步的
            success: function (data) {
                result = data;
            }
        });
        return result;
    }


    //通过rid获取歌曲的歌词
    function getLyric(rid) {
        var result;
        $.ajax({
            url: 'http://lifan.ink:9090/lrc',
            data: {
                "rid": rid
            },
            type: 'GET',
            async: false, // 将async选项设置为false，表示请求是同步的
            success: function (data) {
                result = JSON.parse(data).data.lrclist;
            }
        });
        return result;
    }

    //通过rid获取歌曲的mv
    function getMusicMp4Src(rid) {
        var result;
        $.ajax({
            url: 'http://lifan.ink:9090/mp4',
            data: {
                "rid": rid
            },
            type: 'GET',
            async: false, // 将async选项设置为false，表示请求是同步的
            success: function (data) {
                result = data;
            }
        });
        return result;
    }

    // 通过列表中的按钮 添加歌曲
    function addMusicList(id) {
        var newMusicObject = searchMusicSet[id];
        var isNewMusicObject = musicNameData.indexOf(newMusicObject.name)
        if (isNewMusicObject == -1) {
            //图片数组
            musicImgsData.push(newMusicObject.pic);
            // 歌曲名数组
            musicNameData.push(newMusicObject.name)
            //歌手
            artistNameData.push(newMusicObject.artist)
            //歌词
            lyricSet.push(getLyric(newMusicObject.rid))
            //播放地址
            musicUrls.push(getMusicSrc(newMusicObject.rid))
            // mp4地址
            musicMp4SrcSet.push(getMusicMp4Src(newMusicObject.rid))
            // 0 表示未播放状态
            // console.log(musicMp4SrcSet);
            // 如果添加的歌是第一首则播放
            if (musicNameData.length == 1) selectTrack(2, 0);
            return 0;
        } else {
            selectTrack(2, isNewMusicObject);
            // 1 表示已播放
            return 1;
        }
    }

    // 通过列表中按钮播放 歌曲
    function playerMusic(id) {
        // 先添加到播放列表 会返回0 和 1 
        var result = addMusicList(id)
        if (result == 0) {
            var newMusicObject = searchMusicSet[id];
            var isNewMusicObject = musicNameData.indexOf(newMusicObject.name)
            selectTrack(2, isNewMusicObject);
        }
    }

    // 播放全部 将歌曲添加到播放列表
    function playerAllMusic() {
        for (let i = 0; i < searchMusicSet.length; i++) {
            var newMusicObject = searchMusicSet[i];
            var isNewMusicObject = musicNameData.indexOf(newMusicObject.name)
            if (isNewMusicObject == -1) {
                //图片数组
                musicImgsData.push(newMusicObject.pic);
                // 歌曲名数组
                musicNameData.push(newMusicObject.name)
                //歌手
                artistNameData.push(newMusicObject.artist)
                //播放地址
                musicUrls.push(getMusicSrc(newMusicObject.rid))
            }
        }
        // console.log(musicImgsData, musicNameData, artistNameData, musicUrls);
        //添加完之后，找到搜索列表第一首歌并播放
        selectTrack(2, musicNameData.indexOf(searchMusicSet[0].name));
    }

    // 下载文件功能
    function downloadFile(url, filename) {
        // 创建一个隐藏的<a>标签，设置下载链接和下载文件名
        var link = $("<a>")
            .attr("href", url)
            .attr("download", filename)
            .hide();

        // 将<a>标签添加到DOM树中
        $("body").append(link);

        // 触发<a>标签的点击事件，浏览器会自动下载文件
        link[0].click();

        // 移除<a>标签
        link.remove();
    }

    // 点击 播放/暂停 按钮，触发该函数
    // 作用：根据audio的paused属性 来检测当前音频是否已暂停  true:暂停  false:播放中
    function playPause() {
        if (audio.paused) {
            playerContent1.addClass('active'); // 内容栏上移
            musicImgs.addClass('active'); // 左侧图片开始动画效果
            plyricShowContent.addClass('plyricShowContent showSwing') //歌词开始移动
            playPauseBtn.attr('class', 'btn play-pause icon-zanting iconfont') // 显示暂停图标
            checkBuffering(); // 检测是否需要缓冲
            audio.play(); // 播放
        } else {
            playerContent1.removeClass('active'); // 内容栏下移
            musicImgs.removeClass('active'); // 左侧图片停止旋转等动画效果
            plyricShowContent.removeClass('showSwing') //歌词停止动画效果
            playPauseBtn.attr('class', 'btn play-pause icon-jiediankaishi iconfont'); // 显示播放按钮
            clearInterval(buffInterval); // 清除检测是否需要缓冲的定时器
            musicImgs.removeClass('buffering'); // 移除缓冲类名
            audio.pause(); // 暂停
        }

    }


    // 鼠标移动在进度条上， 触发该函数	
    function showHover(event) {
        seekBarPos = sArea.offset(); // 获取进度条长度
        seekT = event.clientX - seekBarPos.left; //获取当前鼠标在进度条上的位置
        seekLoc = audio.duration * (seekT / sArea.outerWidth()); //当前鼠标位置的音频播放秒数： 音频长度(单位：s)*（鼠标在进度条上的位置/进度条的宽度）

        sHover.width(seekT); //设置鼠标移动到进度条上变暗的部分宽度

        cM = seekLoc / 60; // 计算播放了多少分钟： 音频播放秒速/60

        ctMinutes = Math.floor(cM); // 向下取整
        ctSeconds = Math.floor(seekLoc - ctMinutes * 60); // 计算播放秒数

        if ((ctMinutes < 0) || (ctSeconds < 0))
            return;

        if ((ctMinutes < 0) || (ctSeconds < 0))
            return;

        if (ctMinutes < 10)
            ctMinutes = '0' + ctMinutes;
        if (ctSeconds < 10)
            ctSeconds = '0' + ctSeconds;

        if (isNaN(ctMinutes) || isNaN(ctSeconds))
            insTime.text('--:--');
        else
            insTime.text(ctMinutes + ':' + ctSeconds); // 设置鼠标移动到进度条上显示的信息

        insTime.css({
            'left': seekT,
            'margin-left': '-21px'
        }).fadeIn(0); // 淡入效果显示

    }

    // 鼠标移出进度条，触发该函数
    function hideHover() {
        sHover.width(0); // 设置鼠标移动到进度条上变暗的部分宽度 重置为0
        insTime.text('00:00').css({
            'left': '0px',
            'margin-left': '0px'
        }).fadeOut(0); // 淡出效果显示
    }

    // 鼠标点击进度条，触发该函数
    function playFromClickedPos() {
        audio.currentTime = seekLoc; // 设置音频播放时间 为当前鼠标点击的位置时间
        seekBar.width(seekT); // 设置进度条播放长度，为当前鼠标点击的长度
        hideHover(); // 调用该函数，隐藏原来鼠标移动到上方触发的进度条阴影
    }

    // 在音频的播放位置发生改变是触发该函数
    function updateCurrTime() {
        nTime = new Date(); // 获取当前时间
        nTime = nTime.getTime(); // 将该时间转化为毫秒数

        // 计算当前音频播放的时间
        curMinutes = Math.floor(audio.currentTime / 60);
        curSeconds = Math.floor(audio.currentTime - curMinutes * 60);

        // 计算当前音频总时间
        durMinutes = Math.floor(audio.duration / 60);
        durSeconds = Math.floor(audio.duration - durMinutes * 60);

        // 计算播放进度百分比
        playProgress = (audio.currentTime / audio.duration) * 100;

        // 如果时间为个位数，设置其格式
        if (curMinutes < 10)
            curMinutes = '0' + curMinutes;
        if (curSeconds < 10)
            curSeconds = '0' + curSeconds;

        if (durMinutes < 10)
            durMinutes = '0' + durMinutes;
        if (durSeconds < 10)
            durSeconds = '0' + durSeconds;

        if (isNaN(curMinutes) || isNaN(curSeconds))
            tProgress.text('00:00');
        else
            tProgress.text(curMinutes + ':' + curSeconds);

        if (isNaN(durMinutes) || isNaN(durSeconds))
            totalTime.text('00:00');
        else
            totalTime.text(durMinutes + ':' + durSeconds);

        if (isNaN(curMinutes) || isNaN(curSeconds) || isNaN(durMinutes) || isNaN(durSeconds))
            time.removeClass('active');
        else
            time.addClass('active');

        // 设置播放进度条的长度
        seekBar.width(playProgress + '%');

        // 进度条为100 即歌曲播放完时
        if (playProgress == 100) {
            playPauseBtn.attr('class', 'btn play-pause icon-jiediankaishi iconfont'); // 显示播放按钮
            seekBar.width(0); // 播放进度条重置为0
            tProgress.text('00:00'); // 播放时间重置为 00:00
            musicImgs.removeClass('buffering').removeClass('active'); // 移除相关类名
            clearInterval(buffInterval); // 清除定时器

            selectTrack(1); // 添加这一句，可以实现自动播放
        }
    }

    // 定时器检测是否需要缓冲
    function checkBuffering() {
        clearInterval(buffInterval);
        buffInterval = setInterval(function () {
            // 这里如果音频播放了，则nTime为当前时间毫秒数，如果没播放则为0；如果时间间隔过长，也将缓存
            if ((nTime == 0) || (bTime - nTime) > 1000) {
                musicImgs.addClass('buffering'); // 添加缓存样式类
            } else {
                musicImgs.removeClass('buffering'); // 移除缓存样式类
            }

            bTime = new Date();
            bTime = bTime.getTime();

        }, 100);
    }

    // 点击上一首/下一首时，触发该函数。 
    //注意：后面代码初始化时，会触发一次selectTrack(0)，因此下面一些地方需要判断flag是否为0
    function selectTrack(flag, setCurrIndex) {
        len = musicUrls.length;
        if (flag == 0 || flag == 1) { // 初始 || 点击下一首
            ++currIndex;
            if (currIndex >= len) { // 当处于最后一首时，点击下一首，播放索引置为第一首
                currIndex = 0;
            }
        } else if (flag == -1) { // 点击上一首
            --currIndex;
            if (currIndex <= -1) { // 当处于第一首时，点击上一首，播放索引置为最后一首
                currIndex = len - 1;
            }
        } else if (flag == 2) {
            currIndex = setCurrIndex
        }

        if (flag == 0) {
            playPauseBtn.attr('class', 'btn play-pause icon-jiediankaishi iconfont'); // 显示播放图标
        } else {
            musicImgs.removeClass('buffering');
            playPauseBtn.attr('class', 'btn play-pause icon-zanting iconfont') // 显示暂停图标
        }

        seekBar.width(0); // 重置播放进度条为0
        time.removeClass('active');
        tProgress.text('00:00'); // 播放时间重置
        totalTime.text('00:00'); // 总时间重置

        // 获取当前索引的:歌曲名，歌手名，图片，歌曲链接等信息
        currMusic = musicNameData[currIndex];
        currArtist = artistNameData[currIndex];
        currImg = musicImgsData[currIndex];
        audio.src = musicUrls[currIndex];

        nTime = 0;
        bTime = new Date();
        bTime = bTime.getTime();

        // 如果点击的是上一首/下一首 则设置开始播放，添加相关类名，重新开启定时器
        if (flag != 0) {
            audio.play();
            playerContent1.addClass('active');
            musicImgs.addClass('active');
            plyricShowContent.addClass('plyricShowContent showSwing') //歌词开始移动
            clearInterval(buffInterval);
            checkBuffering();
        }

        // 将歌手名，歌曲名，图片链接，设置到元素上
        artistName.text(currArtist);
        musicName.text(currMusic);
        musicImgs.find('.img').css({
            'background': 'url(' + currImg + ')'
        })
        // 根据音乐播放 显示和隐藏 播放器
        playerShowFn(audio.paused)
        isExpanded = !audio.paused
    }

    // 实在是找不到一个合适css了，只能使用js设置 line-height
    function setExcitingDisplayOverlayLineHight() {
        let boxHeight = $("#excitingDisplay .box").css('height').slice(0, -2);
        $('#excitingDisplay .overlay').css('line-height', (boxHeight - 20) + 'px');
    }
    // 更新歌词
    function updateLyricShowContent(index, audio) {
        let lyricContent = lyricSet[index]
        for (let i = 0; i < lyricContent.length; i++) {
            if (Math.floor(audio.currentTime) /*当前播放的时间*/ == Math.floor(lyricContent[i].time)) {
                plyricShowContent.text(lyricContent[i].lineLyric)
            }
        }
    }

    // 控制整个mp4模块的显示和隐藏
    function ShowMp4(index) {
        // 显示和隐藏的切换
        let showMusicSrc = musicMp4SrcSet[index];
        // 元素的显示和隐藏
        mp4Show.toggle()
        if (mp4Show.is(":visible")) {
            if (!audio.paused) {
                playPause()
            }
            setVideo(showMusicSrc)
            $(document).off("keydown");
            $(document).on('keydown', function (e) {
                if (e.keyCode == 32 && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') { // keyCode 32 代表空格键
                    e.preventDefault(); // 阻止默认行为
                } else if (e.keyCode === 13) {
                    e.preventDefault(); // 阻止默认行为
                    playsearch(1);
                }
            })
        } else {
            removeVideo()
        }
    }

    // 设置video元素的属性
    function setVideo(src) {
        myVideo.attr({
            'autoplay': 'autoplay',
            'id': 'myVideo',
            'src': src,
            'controls': 'controls'
        });
        mp4ShowDiv.append(myVideo);
        myVideo.focus();
    }

    // 移除video元素
    function removeVideo() {
        // 移除video
        myVideo.remove();
        // 重新绑定 播放器事件
        documentKeydown();
    }
    // 文档的键盘事件
    function documentKeydown() {
        // 绑定之后，先清除之前绑定的事件
        $(document).off("keydown");
        $(document).on('keydown', function (e) {
            if (musicNameData.length <= 0) return;
            if (e.keyCode == 32 && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') { // keyCode 32 代表空格键
                e.preventDefault(); // 阻止默认行为
                playPause() //按下空格按钮， 触发playPause函数
                playerShowFn(audio.paused)
                isExpanded = !audio.paused
            } else if (e.keyCode === 13) {
                e.preventDefault(); // 阻止默认行为
                playsearch(1);
            }
        });
    }
    // 是否展示player
    function playerShowFn(isExpanded) {
        // glyphicon glyphicon - chevron - right
        if (isExpanded) {
            player.animate({
                width: "0px"
            });
            playerContent1.hide();
            playerContent2.hide();
            playerShow.removeClass("glyphicon glyphicon-chevron-right");
            playerShow.addClass("player-show-image")
        } else {
            player.animate({
                width: "350px"
            });
            playerContent1.show();
            playerContent2.show();
            playerShow.removeClass("player-show-image");
            playerShow.addClass("glyphicon glyphicon-chevron-right")
        }
    }
    // 初始化函数
    function initPlayer() {
        audio = new Audio(); // 创建Audio对象
        selectTrack(0); // 初始化第一首歌曲的相关信息
        audio.loop = false; // 取消歌曲的循环播放功能

        playPauseBtn.on('click', playPause); // 点击播放/暂停 按钮，触发playPause函数

        // 初始化文档的键盘事件
        documentKeydown();

        // 进度条 移入/移出/点击 动作触发相应函数
        sArea.mousemove(function (event) {
            showHover(event);
        });
        sArea.mouseout(hideHover);
        sArea.on('click', playFromClickedPos);

        // 实时更新播放时间
        $(audio).on('timeupdate', function () {
            updateCurrTime();
            // 实时更新歌词
            updateLyricShowContent(currIndex, this)
        });

        // 上下首切换
        playPrevBtn.on('click', function () {
            selectTrack(-1);
        });
        playNextBtn.on('click', function () {
            selectTrack(1);
        });
        //隐藏和显示player播放器 
        // 按钮playshow绑定 显示隐藏事件

        playerShow.on('click', function () {
            if (musicNameData.length <= 0) return;
            playerShowFn(isExpanded)
            isExpanded = !isExpanded
        });

        // 初始化执行一次 搜索周杰伦
        SingerNameIpt.val('周杰伦')
        playsearch(1);
        // 给搜索按钮添加点击事件
        searchMusic.on('click keydown', function () {
            playsearch(1)
        });

        // 初始化 overlay lineHeight
        setExcitingDisplayOverlayLineHight();
        // 给列表展示的两个小按钮绑定 方法
        $("#musicListTable tbody").on('click', function (e) {
            const pattern1 = /^musicPlayBtn\d$/; //正则表达式1 播放
            const pattern2 = /^musicAddBtn\d$/; //正则表达式2  添加
            const pattern3 = /^musicdownloadBtn\d$/; //正则表达式3  下载
            // 播放按钮
            if (pattern1.test($(e.target).attr('id'))) {
                let index = $(e.target).attr('id').slice(-1)
                playerMusic(index)
            }
            //添加歌曲按钮
            if (pattern2.test($(e.target).attr('id'))) {
                let index = $(e.target).attr('id').slice(-1)
                addMusicList(index)
            }
            // 下载按钮
            if (pattern3.test($(e.target).attr('id'))) {
                let index = $(e.target).attr('id').slice(-1)
                let downloadMusicObject = searchMusicSet[index]
                // 歌曲地址
                let musicUrl = getMusicSrc(downloadMusicObject.rid)
                let musicName = downloadMusicObject.name + ".mp3"
                downloadFile(musicUrl, musicName)
            }
        })

        // 播放全部 事件绑定
        playerAll.on('click', playerAllMusic)
        // 动态生成分页按钮
        var paginationA = pagination.children().children()
        for (let i = 0; i < paginationA.length; i++) {
            $(paginationA[i]).on('click', function () {
                playsearch(i + 1)
            })
        }
        //屏幕变化大小 监控
        $(window).resize(function () {
            // 精彩展示 展示框行高，随父元素变化
            setExcitingDisplayOverlayLineHight();
        });
        // 初始化Mp4播放控件
        mp4Show.hide()
        // Mp4显示按钮
        showVideoBtn.on('click', function () {
            ShowMp4(currIndex)
        })
        // Mp4关闭按钮
        mp4CloseBtn.on('click', function () {
            ShowMp4(currIndex)
        })

    }

    // 调用初始化函数
    initPlayer();
});