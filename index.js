$(function(){
	//0.自定义滚动条
	$(".content_list").mCustomScrollbar();
	var audio=$('audio');
	var player=new Player(audio);
	var progress;
	var voiceprogress;
	
	//1.加载歌曲列表
	getPlayList();
	function getPlayList(){
		$.ajax({
			url:"./source/musiclist.json",
			dataType:"json",
			success:function(data){
				player.musicList=data;
				//1.1遍历获取到的数据，创建每一条音乐
				var musicList=$('.content_list ul');
				$.each(data,function(index,ele){
					var item=crateMusicItem(index,ele);
					musicList.append(item);
				});
				initMusicInfo(data[0]);
			},
			error:function(e) {
				console.log(e);
			}
		})
	};
	//2.初始化歌曲信息
	function initMusicInfo(music){
		//获取对应的元素
		var musicimg=$('.song_info_pic img');
		var musicname=$('.song_info_name a');
		var musicsinger=$('.song_info_singer a');
		var musicAblum=$('.song_info_ablum a');
		var musicprogressname=$('.music_progress_name');
		var musicprogresstime=$('.music_progress_time');
		var musicbg=$('.mask_bg');
		
		//给获取到的元素赋值
		musicimg.attr('src',music.cover);
		musicname.text(music.name);
		musicsinger.text(music.sing);
		musicAblum.text(music.ablum);
		musicprogressname.text(music.name+'/'+music.sing);
		musicprogresstime.text('00:00/'+music.time);
		musicbg.css('background',"url('"+music.cover+"')");
	}
	//2.1初始化进度条
	initprogress();
	function initprogress(){
		var progressBar=$('.music_progress_bar');
		var progressLine=$('.music_progress_line');
		var progressDot=$('.music_progress_dot');
		progress=Progress(progressBar,progressLine,progressDot);
		progress.progressClick(function(value){
			player.MusicSeekTo(value);
		});
		progress.progressMove(function(value){
			player.MusicSeekTo(value);
		});
		
		var voiceBar=$('.music_voice_bar');
		var voiceLine=$('.music_voice_line');
		var voiceDot=$('.music_voice_dot');
		voiceprogress=Progress(voiceBar,voiceLine,voiceDot);
		voiceprogress.progressClick(function(value){
			player.MusicVoiceSeekTo(value);
		});
		voiceprogress.progressMove(function(value){//由于使用的是歌曲进度条的方法，长度设定为650px，所以声音进度会超过背景长度
			player.MusicVoiceSeekTo(value);
		});
	}
	//3.初始化事件监听
	initEvents();
	function initEvents(){
		//1.监听歌曲的移入移出事件
		$(".content_list").delegate(".list_music","mouseenter",function(){
			//显示子菜单
			$(this).find(".list_menu").stop().fadeIn(0);
			$(this).find(".list_time a").stop().fadeIn(0);
			//隐藏时长
			$(this).find(".list_time span").stop().fadeOut(0);
		});
		$(".content_list").delegate(".list_music","mouseleave",function(){
			//隐藏子菜单
			$(this).find(".list_menu").stop().fadeOut(0);
			$(this).find(".list_time a").stop().fadeOut(0);
			//显示时长
			$(this).find(".list_time span").stop().fadeIn(0);
		});
		//2.监听复选框的点击事件
		$(".content_list").delegate(".list_check","click",function(){
			$(this).toggleClass("list_checked");
		});
		//3.添加子菜单播放按钮的监听
		var musicplay=$('.music_play');
		$('.content_list').delegate('.list_menu_play','click',function(){
			var listmusic=$(this).parents(".list_music");
			
			//3.1切换播放图标
			$(this).toggleClass('list_menu_play2');
			//3.2复原其他播放图标
			listmusic.siblings().find('.list_menu_play').removeClass('list_menu_play2');
			//3.3底部同步播放按钮
			if($(this).attr('class').indexOf("list_menu_play2")!=-1){
				//当前子菜单的播放按钮是播放状态
				musicplay.addClass('music_play1');
				//让文字高亮
				listmusic.find('div').css('color','#fff');
				listmusic.siblings().find('div').css('color','rgba(255,255,255,0.5)');
			}else{
				//当前子菜单的播放按钮不是播放状态
				musicplay.removeClass('music_play1');
				//让文字不高亮
				listmusic.find('div').css('color','rgba(255,255,255,0.5)');
			}
			//3.4切换序号的状态
			listmusic.find('.list_number').toggleClass('list_number2');
			listmusic.siblings().find('.list_number').removeClass('list_number2');
			
			//3.5播放音乐
			player.playMusic(listmusic.get(0).index,listmusic.get(0).music);
			
			//3.6切换歌曲信息
			initMusicInfo(listmusic.get(0).music);
			
		});
		//4.监听底部控制区域播放按钮的点击
		musicplay.click(function(){
			//判断之前有没有播放音乐
			if(player.currentIndex==-1){
				//没有播放过音乐
				$(".list_music").eq(0).find('.list_menu_play').trigger("click");
			}else{
				//已经播放过音乐
				$(".list_music").eq(player.currentIndex).find('.list_menu_play').trigger("click");
			}
		});
		//5.监听底部控制区域上一首按钮的点击
		$('.music_pre').click(function(){
			$(".list_music").eq(player.preIndex()).find('.list_menu_play').trigger("click");
			console.log(player.currentIndex);
		})
		//6.监听底部控制区域下一首按钮的点击
		$(".music_next").click(function(){
			$(".list_music").eq(player.nextIndex()).find('.list_menu_play').trigger("click");
			console.log(player.currentIndex);
		});
		//7.监听删除按钮的点击
		$('.content_list').delegate('.list_menu_del','click',function(){
			//找到被点击的音乐
			var item=$(this).parents('.list_music');
			//判断当前音乐是否正在播放
			if(item.get(0).index==player.currentIndex){
				$('.music_next').trigger('click');
			}
			item.remove();
			player.changeMusic(item.get(0).index);
			//重新排序
			$('.list_music').each(function(index,ele){
				ele.index=index;
				$(ele).find('.list_number').text(index+1);
			});
		});
		//8.监听播放的进度
			player.MusicTimeUpdate(function(currenttime,duration,timestr){
				//同步事件
				$('.music_progress_time').text(timestr);
				//同步进度条
				var value=currenttime/duration*100;
				progress.setProgress(value);
				if(value>=100){
					$('.music_next').trigger('click');
				}
			});
		//9.监听声音按钮的点击
		$('.music_voice_icon').click(function(){
			//图标切换
			$(this).toggleClass('music_voice_icon1');
			if($(this).attr('class').indexOf('music_voice_icon1')!=-1){
				//变为没有声音
				player.MusicVoiceSeekTo(0);
			}else{
				//变为有声音
				player.MusicVoiceSeekTo(1);
			}
		})
	}
	 
	//定义一个方法创建一条音乐
	function crateMusicItem(index,music){
		var item=$("<li class=\"list_music\">\n"+
							"<div class=\"list_check \"><i></i></div>\n"+
							"<div class=\"list_number \">"+(index+1)+"</div>\n"+
								"<div class=\"list_name\">"+music.name+""+
								"<div class=\"list_menu\">\n"+
									"<a href=\"javascript:;\" title=\"播放\" class=\"list_menu_play\"></a>\n"+
									"<a href=\"javascript:;\" title=\"添加\"></a>\n"+
									"<a href=\"javascript:;\" title=\"下载\"></a>\n"+
									"<a href=\"javascript:;\" title=\"分享\"></a>\n"+
								"</div>\n"+
							"</div>\n"+
							"<div class=\"list_singer\">"+music.sing+"</div>\n"+
							"<div class=\"list_time\">\n"+
								"<span>"+music.time+"</span>\n"+
								"<a href=\"javascript:;\" title=\"删除\" class=\"list_menu_del\"></a>\n"+
							"</div>\n"+
					"</li>");
					item.get(0).index=index;
					item.get(0).music=music;
					return item;
	}
});