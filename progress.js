(function(){
	function Progress(progressBar,progressLine,progressDot){
		return new Progress.prototype.init(progressBar,progressLine,progressDot);
	}
	Progress.prototype={
		constructor:Progress,
		init:function(progressBar,progressLine,progressDot){
			this.progressBar=progressBar;
			this.progressLine=progressLine;
			this.progressDot=progressDot;
		},
		isMove:false,
		progressClick:function(callback){
			var $this=this;//这里的this是progress 因为需要在内部调用到外部的东西，所以先保存一个$this
			//监听背景的点击
			this.progressBar.click(function(event){//这里面的this是progressBar
				//获取背景距离窗口默认的位置
				var normalLeft=$(this).offset().left;
				//获取鼠标点击的位置距离窗口的位置
				var eventLeft=event.pageX;
				var width=eventLeft-normalLeft;
				if(width>645){
					width=645;
				}
				if(width<0){
					width=0;
				}
				//设置前景的宽度
				$this.progressLine.css('width',width);
				//设置小圆点的位置
				$this.progressDot.css('left',width);
				//计算进度条的比例
				var value=width/$(this).width();
				callback(value);
			})
		},
		progressMove:function(callback){
			var $this=this;
			var eventLeft;
			var width;
			var barwidth=this.progressBar.width();
			//监听鼠标的按下事件
			this.progressBar.mousedown(function(){
				$this.isMove=true;
				//获取背景距离窗口默认的位置
				var normalLeft=$(this).offset().left;//这个this是progressBar
				//监听鼠标的移动事件
				$(document).mousemove(function(){//这里使用document是为了让用户使用方便，只要鼠标点击了之后再界面内任何位置移动都可以控制进度条
					//获取鼠标点击的位置距离窗口的位置
					eventLeft=event.pageX;
					width=eventLeft-normalLeft;
					if(width>=0&&width<=barwidth){
						//设置前景的宽度
						$this.progressLine.css('width',width);
						//设置小圆点的位置
						$this.progressDot.css('left',width);
					}
					
				})
			})
			//监听鼠标的抬起事件
			$(document).mouseup(function(){
				$(document).off('mousemove');
				var value=width/$this.progressBar.width();
				callback(value);
				$this.isMove=false;
			})
		},
		setProgress:function(value){
			if(this.isMove) return;
			if(value<0) return;
			if(isNaN(value)) return;
			if(value>0&&value<100){
				this.progressLine.css({
					width:value+'%'
				});
				this.progressDot.css({
					left:value+'%'
				});
			}
		}
		
	}
	Progress.prototype.init.prototype=Progress.prototype;
	window.Progress=Progress;
})(window);