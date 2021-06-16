(function(){
	function Player(audio){
		return new Player.prototype.init(audio);
	}
	Player.prototype={
		constructor:Player,
		musicList:[],
		init:function(audio){
			this.audio=audio;
			this.audio1=audio.get(0);
		},
		currentIndex:-1,
		playMusic:function(index,music){
			//判断是否是用一首音乐
			if(this.currentIndex==index){
				//同一首音乐
				if(this.audio1.paused){
					this.audio1.play();
				}else{
					this.audio1.pause();
				}
			}else{
				//不是用一首
				this.audio.attr("src",music.link_url);
				this.audio1.play();
				this.currentIndex=index;
			}
		},
		preIndex:function(){
			var index=this.currentIndex-1;
			if(index<0){
				index=this.musicList.length-1;
			}
			return index;
		},
		nextIndex:function(){
			var index=this.currentIndex+1;
			if(index>this.musicList.length-1){
				index=0;
			}
			return index;
		},
		changeMusic:function(index){
			//删除对应的数据
			this.musicList.splice(index,1);
			//判断当前删除的音乐是否是正在播放的音乐的前面的音乐
			if(index<this.currentIndex){
				this.currentIndex=this.currentIndex-1;
			}
		},
		MusicTimeUpdate:function(callback){
			var $this=this;
			this.audio.on('timeupdate',function(){
				var duration=$this.audio1.duration;
				var currenttime=$this.audio1.currentTime;
				var timestr=$this.formatDate(currenttime,duration);
				// $('.music_progress_time').text(timestr); 不写这一句就要加callback回调函数
				callback(currenttime,duration,timestr);
			});
		},
		formatDate:function(currenttime,duration){
			var endMin=parseInt(duration/60);
			var endSec=parseInt(duration%60);
			if(endMin<10){
				endMin='0'+endMin;
			}
			if(endSec<10){
				endSec='0'+endSec;
			}
			var startMin=parseInt(currenttime/60);
			var startSec=parseInt(currenttime%60);
			if(startMin<10){
				startMin='0'+startMin;
			}
			if(startSec<10){
				startSec='0'+startSec;
			}
			if(!isNaN(duration)){
				return startMin+':'+startSec+'/'+endMin+':'+endSec;
			}
		},
		MusicSeekTo:function(value){
			if(isNaN(value)) return;
			this.audio1.currentTime=this.audio1.duration*value;
		},
		MusicVoiceSeekTo:function(value){
			if(isNaN(value)) return;
			if(value<0||value>1) return;
			this.audio1.volume=value;
		}
	}
	Player.prototype.init.prototype=Player.prototype;
	window.Player=Player;
})(window);