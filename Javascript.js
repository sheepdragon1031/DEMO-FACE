//元素在頁面的位置
jQuery.fn.posi = function(){
	return this[0].getBoundingClientRect();
}
//聲明焦點與物件的變數
var Focus = null,obj = [null];
//設定物件導向
function object($this,$id){
	//初始值
	this.self = $($this);
	this.parent = this.self.parent();
	this.alt = $this.alt;
	this.size = 1;
	this.deg = 0;
	
	//修正位置
	this.self.data('parent',this.parent);
	$(this.parent).append($('<div class="image"></div>').prepend('<div class="background"></div>').append(this.self));
	this.parent = this.self.parent();
	this.parent.children(':first-child').mousedown(function (){
		clearFocus();
	})
	
	//設置焦點
	this.self.bind('mousedown',function (){
		$('.image>img').removeClass('Focus');
		$(this).addClass('Focus');
		Focus = obj[$id];
	})
	
	//移動
	this.move = function (iX,iY){
		var top = this.parent.css('top').replace('px','')*1;
		var left = this.parent.css('left').replace('px','')*1;
		this.parent.css({'top':(top - iY)+'px','left':(left - iX)+'px'});
	}
	
	//縮放
	this.scale = function (i){
		this.size += i;
		if(this.size<=0) this.size = 0.1;
		this.transfrom();
	}
	
	//旋轉
	this.rotate = function (i){
		this.deg += i;
		this.transfrom();
	}
	
	//執行縮放和旋轉函數
	this.transfrom = function (){
		this.self.css('transform','scale('+this.size+') rotate('+this.deg+'deg)');
	}
	
	//圖片拖動
	this.parent.draggable({
		revert: 'invalid',
		handle: 'img'
	});
	
	//人臉上傳置中
	if(this.alt=='face'){
		this.parent.css('position','absolute').position({of: $('#picture')});
	}
	
	//重設
	this.Reset = function (){
		this.size = 1;
		this.deg = 0;
		this.transfrom();
		this.parent.attr('style','position: relative;');
		this.self.data('parent').append(this.parent);
		if(this.alt=='face') $('img[alt"face"]').remove();
	}
	
	//抓取圖片的位置、大小
	this.pos = function (){
		var picture = $('#imageFace').posi();
		var self = this.self.posi();
		return {
			top: self.top - picture.top,
			left: self.left - picture.left,
			width: self.width,
			height: self.height
		}
	}
	
	//畫進canvas內
	this.draw = function (c){
		var deg = this.deg;
		this.rotate(-deg);
		c.save();
		c.translate((this.pos().left + (this.pos().width*0.5)),(this.pos().top + (this.pos().height*0.5)));
		c.rotate(deg/180*Math.PI);
		c.drawImage(this.self[0],-(this.pos().width*0.5),-(this.pos().height*0.5),this.pos().width,this.pos().height);
		c.restore();
		this.rotate(deg);
		return c;
	}
}

//函數： 清除焦點
function clearFocus(){
	$('.image>img').removeClass('Focus');
	Focus = null;
}
	
//函數： 上傳
function upload(file,get,response){
	var ajax = new XMLHttpRequest();
	var data = new FormData();
	ajax.open('POST','ajax.php?get='+get);
	if(typeof file=='string' && file.indexOf('data:')===0){
		file = file.substr(file.indexOf(',')+1);
	}else{
		var read = new FileReader();
		read.readAsDataURL(file);
	}
	data.append('file',file);
	if(get==0){
		ajax.upload.onprogress = function (e){
			$('progress').css('opacity',0.6);
			var val = e.loaded/e.total*100;
			$('progress').val(val);
			$('#val').text(val+'%');
			if(val==100)
				$('progress,#val').animate({opacity:0},1000);
		}
	}
	ajax.onreadystatechange = function (){
		if(ajax.readyState==4){
			response(ajax.responseText);
		}
	}
	ajax.send(data);
}

//儲存圖片
function savePicture(){
	var newCanvas = document.createElement('canvas');
	newCanvas.width = $('#picture').width();newCanvas.height = $('#picture').height();
	var canvas = newCanvas.getContext('2d');
	canvas.fillStyle = '#FFF';
	canvas.fillRect(0,0,600,600);
	obj.forEach(function (ob){
		if(ob!=null && ob.parent.css('position')=='absolute') ob.draw(canvas);
	})
	upload(newCanvas.toDataURL(),1,function (src){
		var download = $('<a></a>').attr({'href':src,'download':'face.jpg'});
		download[0].click();
	})
	
}

//網頁讀取完成後讀取
$(document).ready(function() {
	
    //頁籤
	(function (){
		var $item = $('.menuitem'),$sub = $('.submenu');
		$item.click(function (){
			$item.removeClass('active');
			$sub.removeClass('active');
			var i = $(this).attr('id').replace(/\D/g,'')*1-1;
			$item.eq(i).addClass('active');
			$sub.eq(i).addClass('active');
		})
	})()
	
	//上傳檔案
	$('#file').bind('dragover',function (){
		$('.drop').css('background','#eee');
	}).bind('dragleave drop',function (){
		$('.drop').css('background','none');
	}).bind('change',function (){
		var file = this.files[0];
		if(file.type!='image/jpeg'){
			alert('只接受JPG圖檔');
		}else if(file.size/1024>300){
			alert('檔案大小不能超過300KB');
		}else{
			upload(file,0,function (src){
				$('img[alt="face"]').attr('src',src);
				$('img[alt="face"]').each(function() {
					var image = new Image();
					image.alt = 'face';
					image.src = src;
					image.onload = function (){
						$('#picture').find($('img[alt="face"]')).parent().remove();
						$('#picture').append(image);
						obj[0] = new object(this);
						$(this).data('id',0);
						$('img[alt="face"]').parent().css('z-index',0);
					}
                });
			});
		}
	});
	
	//設定物件
	$('.accessories').each(function (){
        obj.push(new object(this,obj.length));
    });
	
	//焦點清空
	$('#imageFace').mousedown(function (){
		clearFocus();
	})
	
	//設定圖片放置區域
	$('#picture').droppable({
		drop: function (e,ui){
			var data = $(ui.draggable);
			if(data.css('position')=='absolute') return;
			obj.forEach(function (ob){
				if(ob!=null && Focus.alt===ob.alt){
					ob.Reset();
				}
			});
			Focus.scale(0.6);
			$('#picture').append(data);
			data.css('position','absolute').position({of: e});
		},
		over: function (e,ui){
			var data = $(ui.draggable);
			if(data.css('position')=='absolute') return;
			data.css('opacity',0.6);
		},
		out: function (e,ui){
			var data = $(ui.draggable);
			data.css('opacity','');
		}
	});
	
	//按鍵改變
	$(document).keydown(function (e){
		if(Focus==null || Focus.parent.css('position')!='absolute') return;
		e.preventDefault();
		var rate = (e.shiftKey)?(10):(1);
		switch(e.keyCode){
			case 37:
				Focus.move(rate*1,0);break;
			case 38:
				Focus.move(0,rate*1);break;
			case 39:
				Focus.move(rate*-1,0);break;
			case 40:
				Focus.move(0,rate*-1);break;
			case 76:
				Focus.rotate(-5);break;
			case 82:
				Focus.rotate(5);break; 
			case 107:
				Focus.scale(0.1);break;
			case 109:
				Focus.scale(-0.1);break;
			case 187:
				if(e.shiftKey) Focus.scale(0.1);break;
			case 189:
				Focus.scale(-0.1);break;
		}
	});
});